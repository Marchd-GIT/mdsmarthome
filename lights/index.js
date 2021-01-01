const app_config = (require('read-appsettings-json').AppConfiguration).json;
const miio = require('miio');
const fetch = require('node-fetch');
const log4js = require('log4js');
let logger = log4js.getLogger();


class Lights {
    async lampOnOff(lamp,num) {
        let url = app_config.MD_lamps[lamp].url;
        let status = await
            this.getLampStatus(lamp,num);
        if (status === true) {
            fetch(url +"/ctl?l" + num + "=0");
            logger.info(url+"/ctl?l" + num + "=0");
        }
        else {
            fetch(url+"/ctl?l" + num + "=1");
            logger.info(url+"/ctl?l" + num + "=1");
        }
    }

    async lampOn(lamp,num) {
        let url = app_config.MD_lamps[lamp].url;
        fetch(url+"/ctl?l" + num + "=1");
        logger.info(url+"/ctl?l" + num + "=1");
    }

    async lampOff(lamp,num) {
        let url = app_config.MD_lamps[lamp].url;
        fetch(url +"/ctl?l" + num + "=0");
        logger.info(url+"/ctl?l" + num + "=0");
    }


    async lampSetValue(lamp,num,value) {
        let url = app_config.MD_lamps[lamp].url;
        fetch(url+"/ctlv/l" + num + "?value="+value);
        logger.info(url+"/ctlv/l" + num + "?value="+value);
    }

    async getLampStatus(lamp,num) {
        let url = app_config.MD_lamps[lamp].url;
        let logger = log4js.getLogger("getLampStatus");
        let status = false;
        try {
            const response = await fetch(url+"/stat/l" + num);
            status = await
                response.json();
            logger.info(url+"/stat/l" + num, response.status, JSON.stringify(status));
        }
        catch (e) {
            logger.error(e)
        }
        return status["l" + num] && status["l" + num] == 1 ? true : false;
    }
    async getLampValue(lamp,num) {
        let url = app_config.MD_lamps[lamp].url;
        let logger = log4js.getLogger("getLampValue");
        let status = false;
        try {
            const response = await fetch(url+"/stat/l" + num);
            status = await
                response.json();
            logger.info(url+"/stat/l" + num, response.status, JSON.stringify(status));
        }
        catch (e) {
            logger.error(e)
        }
        return status.value;
    }
}

module.exports.Lights = Lights;