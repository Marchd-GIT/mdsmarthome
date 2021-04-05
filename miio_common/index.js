const miio = require('miio');
const log4js = require('log4js');


class MiioCommon {

    async  sendMIIO(method, parameters, settings) {
        let logger = log4js.getLogger("sendMIIO");
        try {
            let device = await
                miio.device(settings);
            logger.trace("miIO Connect to : ", JSON.stringify(device.miioModel));
            let mess = await
                device.call(method, parameters, {retries: 5});
            logger.trace(method, JSON.stringify(parameters), JSON.stringify(mess));
            device.destroy();
            return (mess);
        }
        catch (e) {
            logger.error(JSON.stringify(e.code));
            logger.trace(e, method, JSON.stringify(parameters).toString(), settings);
            return (e.code);
        }
    }

}

module.exports.MiioCommon = MiioCommon;