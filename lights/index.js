const miio = require('miio');
const fetch = require('node-fetch');
const log4js = require('log4js');
let logger = log4js.getLogger();


class Lights {

    async lampOnOff(num) {
        let status = await
            this.getLampStatus(num);
        if (status === true) {
            fetch("http://10.20.0.201/ctl?l" + num + "=0");
            logger.info("http://10.20.0.201/ctl?l" + num + "=0");
        }
        else {
            fetch("http://10.20.0.201/ctl?l" + num + "=1");
            logger.info("http://10.20.0.201/ctl?l" + num + "=1");
        }

    }

    async getLampStatus(num) {
        let logger = log4js.getLogger("getLampStatus");
        let status = false;
        try {
            const response = await fetch("http://10.20.0.201/stat/l" + num);
            status = await
                response.json();
            logger.info("http://10.20.0.201/stat/l" + num, response.status, JSON.stringify(status));
        }
        catch (e) {
            logger.error(e)
        }
        return status["l" + num] && status["l" + num] == 1 ? true : false;
    }
}

module.exports.Lights = Lights;