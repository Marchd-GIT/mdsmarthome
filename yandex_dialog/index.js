const app_config = (require('read-appsettings-json').AppConfiguration).json;
const miio = require('miio');
const http = require("http");
const fetch = require('node-fetch');
const log4js = require('log4js');

const {VacuumCleaner} = require('../vacuum_cleaner');
const {Cache}  = require('../cache');
const {Lights} = require('../lights');

let logger = log4js.getLogger();


let vacuumCleaner = new VacuumCleaner;
let cache = new Cache();
let lights = new Lights();


class YandexDialog {
    async getDeviceListState() {
        let yandexListDevices =
        {
            "request_id": "123",
            "payload": {
                "user_id": "321",
                devices: [{
                    "id": "101",
                    "name": "Свет",
                    "room": "Коридор",
                    "type": "devices.types.light",
                    "capabilities": [
                        {
                            "type": "devices.capabilities.on_off",
                            "retrievable": true,
                            "state": {
                                "instance": "on",
                                "value": await lights.getLampStatus(1)
                            }
                        }
                    ],
                }, {
                    "id": "102",
                    "name": "Свет",
                    "room": "Кухня",
                    "type": "devices.types.light",
                    "capabilities": [
                        {
                            "type": "devices.capabilities.on_off",
                            "retrievable": true,
                            "state": {
                                "instance": "on",
                                "value": await lights.getLampStatus(2)
                            }
                        }
                    ],
                }, {
                    "id": "103",
                    "name": "Свет",
                    "room": "Гостиная",
                    "type": "devices.types.light",
                    "capabilities": [
                        {
                            "type": "devices.capabilities.on_off",
                            "retrievable": true,
                            "state": {
                                "instance": "on",
                                "value": await lights.getLampStatus(3)
                            }
                        }
                    ],
                }, {
                    "id": "104",
                    "name": "Свет",
                    "room": "Спальня",
                    "type": "devices.types.light",
                    "capabilities": [
                        {
                            "type": "devices.capabilities.on_off",
                            "retrievable": true,
                            "state": {
                                "instance": "on",
                                "value": await lights.getLampStatus(4)
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

    async validateUserYandex(token) {
        let logger = log4js.getLogger("validateUserYandex");
        let user_info = await this.getUserInfo(token);
        logger.trace("Login: ", user_info.login);
        return user_info && user_info.login == "MarchD" ? true : false
    }

    async runAction(id) {
        let state = await vacuumCleaner.cleanGetState();
        logger.trace("state: ", state);
        if (state != "[6]" || id < 199) {
            switch (id) {
                case "101":
                    lights.lampOnOff(1);
                    break;
                case "102":
                    lights.lampOnOff(2);
                    break;
                case "103":
                    lights.lampOnOff(3);
                    break;
                case "104":
                    lights.lampOnOff(4);
                    break;
                case "200":
                    vacuumCleaner.cleanStartFull();
                    break;
                case "210":
                    vacuumCleaner.cleanStartRoom("hall");
                    break;
                case "211":
                    vacuumCleaner.cleanStartRoom("kitchen");
                    break;
                case "212":
                    vacuumCleaner.cleanStartRoom("lounge");
                    break;
                case "213":
                    vacuumCleaner.cleanStartRoom("bedroom");
                    break;
                case "214":
                    vacuumCleaner.cleanStartRoom("hallway");
                    break;
            }
        }
        else {
            await vacuumCleaner.cleanReturnHome();
        }
    }

    async getUserInfo(token) {
        const user_info = await cache.cacheHttpGetJson(token, app_config.oauth.userinfo_url, {headers: {"Authorization": "OAuth " + token}});
        return user_info;
    }

}


module.exports.YandexDialog = YandexDialog;
