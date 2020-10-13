const app_config = (require('read-appsettings-json').AppConfiguration).json;
const log4js = require('log4js');

const { MiioCommon } = require('../miio_common');

let miioCommon = new MiioCommon();

const vacuum_settings = app_config.vacuum;
const rooms = app_config.rooms;
const full_clean_start = ['set_mode_withroom', [0, 1, 0]];
const return_to_change = ['set_charge', [1]];
const clean_start_one_room = ['set_mode_withroom', [0, 1, 1]];
const clean_get_state = ["get_prop", ["run_state"]];
let roomArray = [];


class VacuumCleaner {
    async  cleanStartRoom(room) {
        roomArray = clean_start_one_room[1];
        roomArray[3] = rooms[room];
        return (JSON.stringify(await miioCommon.sendMIIO(clean_start_one_room[0], roomArray, vacuum_settings)));
    }

    async  cleanStartFull() {
        return (JSON.stringify(await miioCommon.sendMIIO(full_clean_start[0], full_clean_start[1], vacuum_settings)));
    }

    async  cleanReturnHome() {
        return (JSON.stringify(await miioCommon.sendMIIO(return_to_change[0], return_to_change[1], vacuum_settings)));
    }

    async  cleanGetState() {
        /*
         IdleNotDocked = 0
         Idle = 1
         Idle2 = 2
         Cleaning = 3
         Returning = 4
         Docked = 5
         */
        return (JSON.stringify(await miioCommon.sendMIIO(clean_get_state[0], clean_get_state[1], vacuum_settings)));
    }
}

module.exports.VacuumCleaner = VacuumCleaner;