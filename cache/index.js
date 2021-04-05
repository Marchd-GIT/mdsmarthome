const app_config = (require('read-appsettings-json').AppConfiguration).json;
const miio = require('miio');
const http = require("http");
const fetch = require('node-fetch');
const log4js = require('log4js');
const Redis = require("ioredis");
let logger = log4js.getLogger();

const redisHost = app_config.redis ? app_config.redis.host : "127.0.0.1";
const redisPort = app_config.redis ? app_config.redis.port : "6379";
const cacheHttpGetJsontTTL = app_config.cache ? app_config.cache.cacheHttpGetJsontTTL : 2592000; //30 days
const cacheCommonTTL = app_config.cache ? app_config.cache.cacheCommonTTL : 2592000; //30 days
const redis = new Redis(redisPort, redisHost);

class Cache {
    async cacheHttpGetJson(key, url, opts = {}) {
        let logger = log4js.getLogger("cacheHttpGetJson");
        let cache = await  redis.get(key);
        let result = cache ? JSON.parse(cache) : false;
        if (!result) {
            try {
                let response = await
                    fetch(url, opts);
                result = await
                    response.json();
                redis.set(key, JSON.stringify(result), "EX", cacheHttpGetJsontTTL);
                logger.trace(app_config.yandex.oauth.userinfo_url, response.status, JSON.stringify(response));
            }
            catch (e) {
                logger.error(e)
            }
        }
        return result;
    }


    async get(key) {
        let logger = log4js.getLogger("cacheGet");
        let cache = await  redis.get(key);
        logger.trace(key);
        return( cache ? JSON.parse(cache) : false );
    }

    async set(key,value) {
        let logger = log4js.getLogger("cacheSet");
        logger.trace(key,cacheCommonTTL);
        redis.set(key, JSON.stringify(value), "EX", cacheCommonTTL);
    }

}

module.exports.Cache = Cache;