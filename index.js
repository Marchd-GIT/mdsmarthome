const app_config = (require('read-appsettings-json').AppConfiguration).json;
const miio = require('miio');
const http = require("http");
const fetch = require('node-fetch');
const log4js = require('log4js');
const Redis = require("ioredis");
let logger = log4js.getLogger();


logger.level = app_config.log.level;
const host = app_config.http.host;
const port = app_config.http.port;
const vacuum_settings = app_config.vacuum;

const full_clean_start = ['set_mode_withroom', [0, 1, 0]];
const return_to_change = ['set_charge', [1]];
const clean_start_one_room = ['set_mode_withroom', [0, 1, 1]];
const rooms = app_config.rooms;
const redisHost = app_config.redis ? app_config.redis.host : "127.0.0.1";
const redisPort = app_config.redis ? app_config.redis.port : "6379";
const cacheHttpGetJsontTTL = app_config.cache ? app_config.cache.cacheHttpGetJsontTTL : 2592000 ; //30 days


const redis = new Redis(redisPort, redisHost);

var yandexListDevices = {};


async function cacheHttpGetJson(key, url, opts = {}) {
    let logger = log4js.getLogger("cacheHttpGetJson");
    let result = await redis.get(key);
    if (!result) {
        try {
            response = await fetch(url, opts);
            result = await response.json();
            redis.set(key, result,"EX",cacheHttpGetJsontTTL);
            logger.trace(app_config.oauth.userinfo_url, response.status, JSON.stringify(response));
        }
        catch (e) {
            logger.error(e)
        }
    }
    return result;
}




//////////////////VACUUM_CLEANER
async function cleanStartRoom(room){
    roomArray = clean_start_one_room[1];
    roomArray[3] = rooms[room];
    return(JSON.stringify(await sendMIIO(clean_start_one_room[0], roomArray, vacuum_settings)));
}
async function cleanStartFull(){
    return(JSON.stringify(await sendMIIO(full_clean_start[0], full_clean_start[1], vacuum_settings)));
}
async function cleanReturnHome(){
    return(JSON.stringify(await sendMIIO(return_to_change[0], return_to_change[1], vacuum_settings)));
}
////////////////////////////////

async function getLampStatus(room, id) {
    let logger = log4js.getLogger("getLampStatus");
    let status = false;
    try {
        const response = await fetch("http://10.20.0.201/stat/l1");
        status = await response.json();
        logger.info("http://10.20.0.201/stat/l1", response.status, JSON.stringify(status));
    }
    catch (e) {
        logger.error(e.response.body)
    }
    return status.l1 && status.l1 == 1 ? true : false;
}


async function getDeviceListState() {
    yandexListDevices =
    {
        "request_id": "123",
        "payload": {
            "user_id": "321",
            devices: [{
                "id": "100",
                "name": "Свет",
                "room": "Холл",
                "type": "devices.types.light",
                "capabilities": [
                    {
                        "type": "devices.capabilities.on_off",
                        "retrievable": true,
                        "state": {
                            "instance": "on",
                            "value": await getLampStatus()
                        }
                    }
                ],
            },
                {
                    "id": "101",
                    "name": "Пылесос",
                    "room": "Холл",
                    "type": "devices.types.vacuum_cleaner",
                    "capabilities": [
                        {
                            "type": "devices.capabilities.on_off",
                            "retrievable": false,
                            "state": {
                                "instance": "on",
                                "value": false
                            }
                        }
                    ]
                },
                {
                    "id": "102",
                    "name": "Пылесос",
                    "room": "Кухня",
                    "type": "devices.types.vacuum_cleaner",
                    "capabilities": [
                        {
                            "type": "devices.capabilities.on_off",
                            "retrievable": false,
                            "state": {
                                "instance": "on",
                                "value": false
                            }
                        }
                    ]
                },
                {
                    "id": "103",
                    "name": "Пылесос",
                    "room": "Квартира",
                    "type": "devices.types.vacuum_cleaner",
                    "capabilities": [
                        {
                            "type": "devices.capabilities.on_off",
                            "retrievable": false,
                            "state": {
                                "instance": "on",
                                "value": false
                            }
                        }
                    ]
                }
            ]
        }
    };
    return yandexListDevices;
}

function responseHendler(url, status, data, message) { //TODO
    let response = {
        "url": url,
        "status": status || 0,
        "data": data || "",
        "message": message || ""
    };
    return (JSON.stringify(response));
}

async function getUserInfo(token) {
    let logger = log4js.getLogger("getUserInfo");
    const user_info = await cacheHttpGetJson(token, app_config.oauth.userinfo_url, {headers: {"Authorization": "OAuth " + token}});
    return user_info;
}
async function validateUserYandex(token) {
    let user_info = await getUserInfo(token);
    return user_info && user_info.login == "MarchD" ? true : false
}
async function sendMIIO(method, parameters, settings) {
    let logger = log4js.getLogger("sendMIIO");
    try {
        let device = await
            miio.device(settings);
        logger.info("miIO Connect to : ", JSON.stringify(device.miioModel));
        let mess = await
            device.call(method, parameters, {retries: 1});
        logger.info(method, JSON.stringify(parameters), JSON.stringify(mess));
        device.destroy();
        return (mess);
    }
    catch (e) {
        logger.error(JSON.stringify(e.code));
        logger.trace(e, method, JSON.stringify(parameters).toString(), settings);
        return (e.code);
    }
}

const requestListener = async function (req, res) {
    let logger = log4js.getLogger("requestListener");
    res.setHeader("Content-Type", "application/json");
    let token = req.headers['authorization'] ? req.headers['authorization'].replace("Bearer ", "") : "";
    let roomArray = [];
    switch (req.url) {
        case "/clean_robot/room/hall":
            res.writeHead(200);
            res.end(cleanStartRoom("hall"));
            break;
        case "/clean_robot/room/kitchen":
            res.writeHead(200);
            res.end(cleanStartRoom("kitchen"));
            break;
        case "/clean_robot/room/lounge":
            res.writeHead(200);
            res.end(cleanStartRoom("lounge"));
            break;
        case "/clean_robot/room/bedroom":
            res.writeHead(200);
            res.end(cleanStartRoom("bedroom"));
            break;
        case "/clean_robot/room/hallway":
            res.writeHead(200);
            res.end(cleanStartRoom("hallway"));
            break;
        case "/clean_robot/full":
            res.writeHead(200);
            res.end(cleanStartFull());
            break;
        case "/clean_robot/home":
            res.writeHead(200);
            res.end(cleanReturnHome());
            break;
        case "/smart_home/v1.0/user/devices":
            if (validateUserYandex(token)) {
                res.writeHead(200);
                logger.info('/smart_home/v1.0/user/devices');
                res.end(JSON.stringify(await getDeviceListState()));
            }
            else {
                res.writeHead(403);
            }
            break;
        case "/smart_home/v1.0/user/unlink":
            if (validateUserYandex(token)) {
                res.writeHead(200);
                logger.info('/smart_home/v1.0/user/unlink');
                res.end(JSON.stringify({"request_id": "1"}));
            }
            else {
                res.writeHead(403);
            }
            break;
        case "/smart_home/v1.0/user/devices/query":
            res.writeHead(200);
            logger.info('/smart_home/v1.0/user/devices/query');
            res.end(JSON.stringify(await getDeviceListState()));
            break;
        case "/smart_home/v1.0/user/devices/action":
            res.writeHead(200);
            logger.info('/smart_home/v1.0/user/devices/action');
            let data = []
            req.on('data', chunk => {
                data.push(chunk)
            });
            req.on('end', async() => {
                logger.trace(data.toString());
                let status = await getLampStatus();
                if (status === true) {
                    fetch("http://10.20.0.201/ctl?l1=0");
                    logger.info("http://10.20.0.201/ctl?l1=0");
                }

                else {
                    fetch("http://10.20.0.201/ctl?l1=1");
                    logger.info("http://10.20.0.201/ctl?l1=1");
                }
                let id = JSON.parse(data).payload.devices[0].id;
                let sendlist = Object.assign({}, yandexListDevices);
                yandexListDevices.payload.devices.forEach((device, index) => {
                    if (device.id == id) {
                        logger.trace(id);
                        sendlist.payload.devices[index].capabilities[0].state.action_result = {"status": "DONE"};
                        delete(sendlist.payload.devices[index].capabilities[0].state.value);
                        logger.trace(JSON.stringify(sendlist));
                    }
                });
                res.end(JSON.stringify(sendlist));
            });
            break;
        default:
            res.writeHead(404);
            res.end(JSON.stringify({error: "Command not found"}));
            logger.error(req.url, req.data, "Command not found");
    }
};


logger.info("start init");
getDeviceListState();

logger.info("init complete");
const server = http.createServer(requestListener);
server.listen(port, host, () => {
    let logger = log4js.getLogger("createServer");
    logger.info(`Server is running on http://${host}:${port}`);
});

