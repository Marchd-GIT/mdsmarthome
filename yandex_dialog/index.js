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


    async updateBackgroundDeviceListState() {
        let state = await this.getDeviceListState("cache");
        cache.set("updateBackgroundDeviceListState", state);
        this.sendDeviceStatus(state);
    }

    async getDeviceListStateCache(requestid) {
        let result = cache.get("updateBackgroundDeviceListState");
        result.request_id = requestid;
        return (result);

    }

    async getDeviceListState(requestid) {
        const cleaner_Status = await vacuumCleaner.cleanGetStatus();
        let yandexListDevices =
        {
            "request_id": requestid,
            "payload": {
                "user_id": app_config.yandex.user_id,
                devices: [{
                    "id": "101",
                    "name": "Свет",
                    "room": "Коридор",
                    "type": "devices.types.light",
                    "capabilities": [
                        {
                            "type": "devices.capabilities.on_off",
                            "retrievable": true,
                            "reportable": true,
                            "state": {
                                "instance": "on",
                                "value": await lights.getLampStatus("dimmers", 1)
                            }
                        }, {
                            "type": "devices.capabilities.range",
                            "state": {
                                "instance": "brightness",
                                "relative": true,
                                "value": await lights.getLampValue("dimmers", 1),
                            },
                            "retrievable": true,
                            "reportable": true,
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
                }, {
                    "id": "102",
                    "name": "Свет",
                    "room": "Кухня",
                    "type": "devices.types.light",
                    "capabilities": [
                        {
                            "type": "devices.capabilities.on_off",
                            "retrievable": true,
                            "reportable": true,
                            "state": {
                                "instance": "on",
                                "value": await lights.getLampStatus("dimmers", 5)
                            }
                        }, {
                            "type": "devices.capabilities.range",
                            "state": {
                                "instance": "brightness",
                                "relative": true,
                                "value": await lights.getLampValue("dimmers", 5),
                            },
                            "retrievable": true,
                            "reportable": true,
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
                }, {
                    "id": "103",
                    "name": "Свет",
                    "room": "Гостиная",
                    "type": "devices.types.light",
                    "capabilities": [
                        {
                            "type": "devices.capabilities.on_off",
                            "retrievable": true,
                            "reportable": true,
                            "state": {
                                "instance": "on",
                                "value": await lights.getLampStatus("dimmers", 2)
                            }
                        }, {
                            "type": "devices.capabilities.range",
                            "state": {
                                "instance": "brightness",
                                "relative": true,
                                "value": await lights.getLampValue("dimmers", 2),
                            },
                            "retrievable": true,
                            "reportable": true,
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
                }, {
                    "id": "104",
                    "name": "Свет",
                    "room": "Спальня",
                    "type": "devices.types.light",
                    "capabilities": [
                        {
                            "type": "devices.capabilities.on_off",
                            "retrievable": true,
                            "reportable": true,
                            "state": {
                                "instance": "on",
                                "value": await lights.getLampStatus("dimmers", 4)
                            }
                        }, {
                            "type": "devices.capabilities.range",
                            "state": {
                                "instance": "brightness",
                                "relative": true,
                                "value": await lights.getLampValue("dimmers", 4),
                            },
                            "retrievable": true,
                            "reportable": true,
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
                }, {
                    "id": "105",
                    "name": "Свет",
                    "room": "Ванна",
                    "type": "devices.types.light",
                    "capabilities": [
                        {
                            "type": "devices.capabilities.on_off",
                            "retrievable": true,
                            "reportable": true,
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
                            "reportable": true,
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
                                "reportable": true,
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
                                "reportable": true,
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
                                "reportable": true,
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
                                "reportable": true,
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
                                "reportable": true,
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
                                "reportable": true,
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
                                "reportable": true,
                                "state": {
                                    "instance": "on",
                                    "value": cleaner_Status
                                }
                            }
                        ]
                    },
                    {
                        "id": "106",
                        "name": "Свет",
                        "room": "Прихожая",
                        "type": "devices.types.light",
                        "capabilities": [
                            {
                                "type": "devices.capabilities.on_off",
                                "retrievable": true,
                                "reportable": true,
                                "state": {
                                    "instance": "on",
                                    "value": await lights.getLampStatus("dimmers", 3)
                                }
                            }, {
                                "type": "devices.capabilities.range",
                                "state": {
                                    "instance": "brightness",
                                    "relative": true,
                                    "value": await lights.getLampValue("dimmers", 3),
                                },
                                "retrievable": true,
                                "reportable": true,
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
                        "id": "107",
                        "name": "Верхний свет",
                        "room": "Гостиная",
                        "type": "devices.types.light",
                        "capabilities": [
                            {
                                "type": "devices.capabilities.on_off",
                                "retrievable": true,
                                "reportable": true,
                                "state": {
                                    "instance": "on",
                                    "value": await lights.getLampStatus("4Lamps", 4)
                                }
                            }
                        ],
                    },
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
        let vacuum_cleaning_now =  ( state == "[3]" || state == "[6]" )  ? true : false;
        logger.trace("vacuum_cleening: ", vacuum_cleaning_now);
        if (!vacuum_cleaning_now || id < 199) {
            switch (id) {
                case "101":
                    lights.lampOnOff("dimmers", 1);
                    break;
                case "102":
                    lights.lampOnOff("dimmers", 5);
                    break;
                case "103":
                    lights.lampOnOff("dimmers", 2);
                    break;
                case "104":
                    lights.lampOnOff("dimmers", 4);
                    break;
                case "105":
                    lights.lampOnOff("bathroom", 1);
                    break;
                case "106":
                    lights.lampOnOff("dimmers", 3);
                    break;
                case "107":
                    lights.lampOnOff("4Lamps", 4);
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
            case "101":
                relative ?
                    lights.lampSetValue("dimmers", 1, value + await lights.getLampValue("dimmers", 1)) :
                    lights.lampSetValue("dimmers", 1, value);
                break;
            case "104":
                relative ?
                    lights.lampSetValue("dimmers", 4, value + await lights.getLampValue("dimmers", 4)) :
                    lights.lampSetValue("dimmers", 4, value);
                break;
            case "103":
                relative ?
                    lights.lampSetValue("dimmers", 2, value + await lights.getLampValue("dimmers", 2)) :
                    lights.lampSetValue("dimmers", 2, value);
                break;
            case "106":
                relative ?
                    lights.lampSetValue("dimmers", 3, value + await lights.getLampValue("dimmers", 3)) :
                    lights.lampSetValue("dimmers", 3, value);
                break;
            case "102":
                relative ?
                    lights.lampSetValue("dimmers", 5, value + await lights.getLampValue("dimmers", 5)) :
                    lights.lampSetValue("dimmers", 5, value);
                break;

        }
    }

    runActionControl(data, yandexListDevices, requestid) {
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
        this.updateBackgroundDeviceListState();
        return (JSON.stringify(sendlist));
    }

    async getUserInfo(token) {
        let logger = log4js.getLogger("getUserInfo");
        logger.trace("Token: ", token);
        const user_info = await cache.cacheHttpGetJson(token, app_config.yandex.oauth.userinfo_url, {headers: {"Authorization": "OAuth " + token}});
        return user_info;
    }

    async sendDeviceStatus(devState) {
        let logger = log4js.getLogger("sendDeviceStatus");
        let devinfo = {
            "ts": ((new Date()) * 1).toString().slice(0, 10) * 1,
            "payload": devState.payload
        };
        logger.trace("sendDeviceStatus URL: ", app_config.yandex.skill_callback_url + '/' + app_config.yandex.skill_id + '/callback/state');

        let response = await fetch(app_config.yandex.skill_callback_url + '/' + app_config.yandex.skill_id + '/callback/state',
            {
                method: 'POST',
                headers: {
                    "Authorization": "OAuth " + app_config.yandex.skill_owner_token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(devinfo)
            }
        );
        let result = await response.text();

        logger.trace("sendDeviceStatusRequest: ",JSON.stringify(devinfo) );
        logger.trace("sendDeviceStatusResponse: ", result);
    }

}


module.exports.YandexDialog = YandexDialog;
