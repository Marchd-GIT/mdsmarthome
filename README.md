# mdsmarthome
custom devices provider 

for example:

esp8266 -> mdsmarthome -> Yandex dialogs

esp8266 -> mdsmarthome -> Blink webhooks 

miio -> mdsmarthome -> Yandex dialogs

miio -> mdsmarthome -> Blink webhooks 


## Deploy

### Dependency
* Redis (Redis server v=2.8.17) or KeyDB for cache 
* nodejs v8.17.0
* npm v6.13.4+

### Add config file 
```appsettings.json```
```{
  "http": {
    "host": "10.20.0.16",
    "port": "8055"
  },
  "vacuum": {
    "address": "x.x.x.x", // device ip
    "token": "3829446e364b634e6a69535842575872" // miio token
  },
  "MD_lamps": {
    "4Lamps": {
      "url": "http://x.x.x.x"
    },
    "bathroom": {
      "url": "http://x.x.x.x"
    },
    "dimmers": {
      "url": "http://x.x.x.x"
    }
  },
  "rooms": {
    "hall": 15, // id device for control
    "kitchen": 10,
    "lounge": 13,
    "bedroom": 14,
    "hallway": 12,
    "bathroom": 11
  },
  "log": {
    "level": "trace" // log level 
  },
  "yandex": {
    "skill_id":"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", 
    "user_id":"321",
    "skill_callback_url":"https://dialogs.yandex.net/api/v1/skills",
    "skill_owner_token":"xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "oauth": {
      "userinfo_url": "https://login.yandex.ru/info?format=json&with_openid_identity=1"
    }
  },
  "redis": {
    "host": "127.0.0.1",
    "port": "6379"
  }
}
```
