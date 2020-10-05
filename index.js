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


////////////////////////////Yandex
var yandexListDevices = {};
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
                    "id": "200",
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
                },
                {
                    "id": "210",
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
                    "id": "211",
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
                    "id": "212",
                    "name": "Пылесос",
                    "room": "Гостиная",
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
                    "id": "213",
                    "name": "Пылесос",
                    "room": "Спальня",
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
                    "id": "214",
                    "name": "Пылесос",
                    "room": "Коридор",
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
async function validateUserYandex(token) {
    let user_info = await getUserInfo(token);
    return user_info && user_info.login == "MarchD" ? true : false
}
async function runAction(id) {
    let logger = log4js.getLogger("runAction");
    let state = await cleanGetState();
    logger.trace("state: ", state);
    if (state != "[6]" || id < 199 ) {
        switch (id) {
            case "100":
                lampOnOff();
                break;
            case "200":
                cleanStartFull();
                break;
            case "210":
                cleanStartRoom("hall");
                break;
            case "211":
                cleanStartRoom("kitchen");
                break;
            case "212":
                cleanStartRoom("lounge");
                break;
            case "213":
                cleanStartRoom("bedroom");
                break;
            case "214":
                cleanStartRoom("hallway");
                break;
        }
    }
    else {
        await cleanReturnHome();
    }
}
async function getUserInfo(token) {
    let logger = log4js.getLogger("getUserInfo");
    const user_info = await cacheHttpGetJson(token, app_config.oauth.userinfo_url, {headers: {"Authorization": "OAuth " + token}});
    return user_info;
}
/////////////////////////////////


////////////////////////////Cache
const redisHost = app_config.redis ? app_config.redis.host : "127.0.0.1";
const redisPort = app_config.redis ? app_config.redis.port : "6379";
const cacheHttpGetJsontTTL = app_config.cache ? app_config.cache.cacheHttpGetJsontTTL : 2592000; //30 days
const redis = new Redis(redisPort, redisHost);
async function cacheHttpGetJson(key, url, opts = {}) {
    let logger = log4js.getLogger("cacheHttpGetJson");
    let result = await redis.get(key);
    if (!result) {
        try {
            response = await fetch(url, opts);
            result = await response.json();
            redis.set(key, result, "EX", cacheHttpGetJsontTTL);
            logger.trace(app_config.oauth.userinfo_url, response.status, JSON.stringify(response));
        }
        catch (e) {
            logger.error(e)
        }
    }
    return result;
}
/////////////////////////////////


//////////////////VACUUM_CLEANER
const rooms = app_config.rooms;
const full_clean_start = ['set_mode_withroom', [0, 1, 0]];
const return_to_change = ['set_charge', [1]];
const clean_start_one_room = ['set_mode_withroom', [0, 1, 1]];
const clean_get_state = ["get_prop", ["run_state"]];
async function cleanStartRoom(room) {
    roomArray = clean_start_one_room[1];
    roomArray[3] = rooms[room];
    return (JSON.stringify(await sendMIIO(clean_start_one_room[0], roomArray, vacuum_settings)));
}
async function cleanStartFull() {
    return (JSON.stringify(await sendMIIO(full_clean_start[0], full_clean_start[1], vacuum_settings)));
}
async function cleanReturnHome() {
    return (JSON.stringify(await sendMIIO(return_to_change[0], return_to_change[1], vacuum_settings)));
}
async function cleanGetState() {
    /*
     IdleNotDocked = 0
     Idle = 1
     Idle2 = 2
     Cleaning = 3
     Returning = 4
     Docked = 5
     */
    return (JSON.stringify(await sendMIIO(clean_get_state[0], clean_get_state[1], vacuum_settings)));
}
////////////////////////////////


//////////////////////////lights
async function lampOnOff() {
    let status = await getLampStatus();
    if (status === true) {
        fetch("http://10.20.0.201/ctl?l1=0");
        logger.info("http://10.20.0.201/ctl?l1=0");
    }
    else {
        fetch("http://10.20.0.201/ctl?l1=1");
        logger.info("http://10.20.0.201/ctl?l1=1");
    }

}
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
////////////////////////////////


////////////////////////////MIIO
async function sendMIIO(method, parameters, settings) {
    let logger = log4js.getLogger("sendMIIO");
    try {
        let device = await
            miio.device(settings);
        logger.info("miIO Connect to : ", JSON.stringify(device.miioModel));
        let mess = await
            device.call(method, parameters, {retries: 5});
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
////////////////////////////////


const requestListener = async function (req, res) {
    let logger = log4js.getLogger("requestListener");
    res.setHeader("Content-Type", "application/json");
    let token = req.headers['authorization'] ? req.headers['authorization'].replace("Bearer ", "") : "";
    let roomArray = [];
    switch (req.url) {
        case "/clean_robot/room/hall":
            res.writeHead(200);
            res.end(await cleanStartRoom("hall"));
            break;
        case "/clean_robot/room/kitchen":
            res.writeHead(200);
            res.end(await cleanStartRoom("kitchen"));
            break;
        case "/clean_robot/room/lounge":
            res.writeHead(200);
            res.end(await cleanStartRoom("lounge"));
            break;
        case "/clean_robot/room/bedroom":
            res.writeHead(200);
            res.end(await cleanStartRoom("bedroom"));
            break;
        case "/clean_robot/room/hallway":
            res.writeHead(200);
            res.end(await cleanStartRoom("hallway"));
            break;
        case "/clean_robot/full":
            res.writeHead(200);
            res.end(await cleanStartFull());
            break;
        case "/clean_robot/home":
            res.writeHead(200);
            res.end(await cleanReturnHome());
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

                let id = JSON.parse(data).payload.devices[0].id;
                let sendlist = Object.assign({}, yandexListDevices);
                yandexListDevices.payload.devices.forEach((device, index) => {
                    if (device.id == id) {
                        runAction(id);
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

