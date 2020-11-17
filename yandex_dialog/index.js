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

    async getDeviceListState(requestid) {
        const cleaner_Status = await vacuumCleaner.cleanGetStatus();
        let yandexListDevices =
        {
            "request_id": requestid,
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
                                "value": await lights.getLampStatus("4Lamps", 1)
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
                                "value": await lights.getLampStatus("4Lamps", 2)
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
                                "value": await lights.getLampStatus("4Lamps", 3)
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
                                "value": await lights.getLampStatus("4Lamps", 4)
                            }
                        }
                    ],
                }, {
                    "id": "105",
                    "name": "Свет",
                    "room": "Ванна",
                    "type": "devices.types.light",
                    "capabilities": [
                        {
                            "type": "devices.capabilities.on_off",
                            "retrievable": true,
                            "state": {
                                "instance": "on",
                                "value": await lights.getLampStatus("bathroom", 1)
                            }
                        }, {
                            "type": "devices.capabilities.range",
                            "state": {
                                "instance": "brightness",
                                "relative": true,
                                "value": await lights.getLampValue("bathroom", 1),
                            },
                            "retrievable": true,
                            "parameters": {
                                "instance": "brightness",
                                "random_access": true,
                                "range": {
                                    "max": 100,
                                    "min": 1,
                                    "precision": 10
                                },
                                "unit": "unit.percent"
                            }
                        },
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
                                "retrievable": true,
                                "state": {
                                    "instance": "on",
                                    "value": cleaner_Status
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
                                "retrievable": true,
                                "state": {
                                    "instance": "on",
                                    "value": cleaner_Status
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
                                "retrievable": true,
                                "state": {
                                    "instance": "on",
                                    "value": cleaner_Status
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
                                "retrievable": true,
                                "state": {
                                    "instance": "on",
                                    "value": cleaner_Status
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
                                "retrievable": true,
                                "state": {
                                    "instance": "on",
                                    "value": cleaner_Status
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
                                "retrievable": true,
                                "state": {
                                    "instance": "on",
                                    "value": cleaner_Status
                                }
                            }
                        ]
                    },
                    {
                        "id": "215",
                        "name": "Пылесос",
                        "room": "Ванна",
                        "type": "devices.types.vacuum_cleaner",
                        "capabilities": [
                            {
                                "type": "devices.capabilities.on_off",
                                "retrievable": true,
                                "state": {
                                    "instance": "on",
                                    "value": cleaner_Status
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
        return (user_info
        && user_info.login.match(/MarchD|furlize/)
        ) ? true : false
    }

    async runActionOnOff(id) {
        let state = await vacuumCleaner.cleanGetState();
        logger.trace("state: ", state);
        if (state != "[6]" || id < 199) {
            switch (id) {
                case "101":
                    lights.lampOnOff("4Lamps", 1);
                    break;
                case "102":
                    lights.lampOnOff("4Lamps", 2);
                    break;
                case "103":
                    lights.lampOnOff("4Lamps", 3);
                    break;
                case "104":
                    lights.lampOnOff("4Lamps", 4);
                    break;
                case "105":
                    lights.lampOnOff("bathroom", 1);
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
                case "215":
                    vacuumCleaner.cleanStartRoom("bathroom");
                    break;
            }
        }
        else {
            await vacuumCleaner.cleanReturnHome();
        }
    }

    async runActionRange(id, value, relative) {
        switch (id) {
            case "105":
                relative ?
                    lights.lampSetValue("bathroom", 1, value + await lights.getLampValue("bathroom", 1)) :
                    lights.lampSetValue("bathroom", 1, value);
                break;
        }
    }

    runActionControl(data,yandexListDevices,requestid) {
        let sendlist = Object.assign({}, yandexListDevices);
        let dataObj = JSON.parse(data);
        dataObj.payload.devices.forEach((device, index) => {
            device.capabilities.forEach((cap, index_cap) => {
                switch (cap.type) {
                    case  "devices.capabilities.range" :
                        this.runActionRange(device.id, cap.state.value, cap.state.relative ? cap.state.relative : false);
                        logger.trace("RUN devices.capabilities.range", device.id, index, index_cap, cap.state.value);
                        yandexListDevices.payload.devices.forEach((device_list, index_list) => {
                            if (device_list.id == device.id) {
                                device_list.capabilities.forEach((cap_list, index_cap_list) => {
                                    if (cap_list.type == cap.type) {
                                        sendlist.request_id = requestid;
                                        sendlist.payload.devices[index_list].capabilities[index_cap_list].state.action_result = {"status": "DONE"};
                                        delete(sendlist.payload.devices[index_list].capabilities[index_cap_list].state.value);
                                        logger.trace("SEND LIST:", JSON.stringify(sendlist));
                                    }
                                })
                            }
                        });
                        break;
                    case  "devices.capabilities.on_off" :
                        this.runActionOnOff(device.id, index, index_cap);
                        logger.trace("RUN devices.capabilities.on_off", device.id);
                        yandexListDevices.payload.devices.forEach((device_list, index_list) => {
                            if (device_list.id == device.id) {
                                device_list.capabilities.forEach((cap_list, index_cap_list) => {
                                    if (cap_list.type == cap.type) {
                                        sendlist.request_id = requestid;
                                        sendlist.payload.devices[index_list].capabilities[index_cap_list].state.action_result = {"status": "DONE"};
                                        delete(sendlist.payload.devices[index_list].capabilities[index_cap_list].state.value);
                                        logger.trace("SEND LIST:", JSON.stringify(sendlist));
                                    }
                                })
                            }
                        });
                        break;
                }
            });
        });
        return (JSON.stringify(sendlist));
    }

    async getUserInfo(token) {
        let logger = log4js.getLogger("getUserInfo");
        logger.trace("Token: " ,token);
        const user_info = await cache.cacheHttpGetJson(token, app_config.oauth.userinfo_url, {headers: {"Authorization": "OAuth " + token}});
        return user_info;
    }

}


module.exports.YandexDialog = YandexDialog;
