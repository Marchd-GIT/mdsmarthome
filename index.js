const app_config = (require('read-appsettings-json').AppConfiguration).json;
const http = require("http");
const log4js = require('log4js');
const { YandexDialog } = require('./yandex_dialog');
const { VacuumCleaner }= require('./vacuum_cleaner');

let logger = log4js.getLogger();

logger.level = app_config.log.level;

let yandexDialog = new YandexDialog();
let vacuumCleaner =  new VacuumCleaner();

let yandexListDevices ={};

const host = app_config.http.host;
const port = app_config.http.port;


const requestListener = async function (req, res) {
    let logger = log4js.getLogger("requestListener");
    res.setHeader("Content-Type", "application/json");
    let token = req.headers['authorization'] ? req.headers['authorization'].replace("Bearer ", "") : "";

    switch (req.url) {
        case "/clean_robot/room/hall":
            res.writeHead(200);
            res.end(await vacuumCleaner.cleanStartRoom("hall"));
            break;
        case "/clean_robot/room/kitchen":
            res.writeHead(200);
            res.end(await vacuumCleaner.cleanStartRoom("kitchen"));
            break;
        case "/clean_robot/room/lounge":
            res.writeHead(200);
            res.end(await vacuumCleaner.cleanStartRoom("lounge"));
            break;
        case "/clean_robot/room/bedroom":
            res.writeHead(200);
            res.end(await vacuumCleaner.cleanStartRoom("bedroom"));
            break;
        case "/clean_robot/room/hallway":
            res.writeHead(200);
            res.end(await vacuumCleaner.cleanStartRoom("hallway"));
            break;
        case "/clean_robot/full":
            res.writeHead(200);
            res.end(await vacuumCleaner.cleanStartFull());
            break;
        case "/clean_robot/home":
            res.writeHead(200);
            res.end(await vacuumCleaner.cleanReturnHome());
            break;
        case "/smart_home/v1.0/user/devices":
            if (yandexDialog.validateUserYandex(token)) {
                res.writeHead(200);
                logger.info('/smart_home/v1.0/user/devices');
                res.end(JSON.stringify(await yandexDialog.getDeviceListState()));
            }
            else {
                res.writeHead(403);
            }
            break;
        case "/smart_home/v1.0/user/unlink":
            if (yandexDialog.validateUserYandex(token)) {
                res.writeHead(200);
                logger.info('/smart_home/v1.0/user/unlink');
                res.end(JSON.stringify({"request_id": "1"}));
            }
            else {
                res.writeHead(403);
            }
            break;
        case "/smart_home/v1.0/user/devices/query":
            if (yandexDialog.validateUserYandex(token)) {
                res.writeHead(200);
                logger.info('/smart_home/v1.0/user/devices/query');
                res.end(JSON.stringify(await yandexDialog.getDeviceListState()));

            }
            else {
                res.writeHead(403);
            }
            break;
        case "/smart_home/v1.0/user/devices/action":
            if (yandexDialog.validateUserYandex(token)) {
                res.writeHead(200);
                logger.info('/smart_home/v1.0/user/devices/action');
                let data = []
                req.on('data', chunk => {
                    data.push(chunk)
                });
                req.on('end', async() => {

                    logger.trace(data.toString());

                    let id = JSON.parse(data).payload.devices[0].id;
                    logger.trace("Ya devs",JSON.stringify(yandexListDevices));
                    let sendlist = Object.assign({}, yandexListDevices);
                    yandexListDevices.payload.devices.forEach((device, index) => {
                        if (device.id == id) {
                            yandexDialog.runAction(id);
                            logger.trace(id);
                            sendlist.payload.devices[index].capabilities[0].state.action_result = {"status": "DONE"};
                            delete(sendlist.payload.devices[index].capabilities[0].state.value);
                            logger.trace(JSON.stringify(sendlist));
                        }
                    });
                    res.end(JSON.stringify(sendlist));
                });
            }
            else {
                res.writeHead(403);
            }
            break;
        case "/smart_home/vacuum_cleaner": // Навык Общего типа заглушка
            res.writeHead(200);
            logger.info('/smart_home/vacuum_cleaner');
            res.end(JSON.stringify(
                {
                    "response": {
                        "text": "Здравствуйте! Это мы, хороводоведы.",
                        "tts": "Здравствуйте! Это мы, хоров+одо в+еды.",
                        "buttons": [
                            {
                                "title": "Надпись на кнопке",
                                "payload": {},
                                "url": "https://example.com/",
                                "hide": true
                            }
                        ],
                        "end_session": false
                    },
                    "version": "1.0"
                }
            ));
            break;
        default:
            res.writeHead(200);
            res.end(JSON.stringify({error: "Command not found, return 200 ok"}));
            logger.error(req.url, req.data, "ok");
    }
};


async function init() {
    logger.info("start init");
    yandexListDevices = await yandexDialog.getDeviceListState();
    logger.info("init complete");
}

init();

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    let logger = log4js.getLogger("createServer");
    logger.info(`Server is running on http://${host}:${port}`);
});

