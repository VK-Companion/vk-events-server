const express = require('express'),
    app = express()
const vk = require('vkapi-lib')
const mysql = require('mysql'),
    db = mysql.createConnection({
        multipleStatements: true,
        host     : 'localhost',
        user     : 'vk-events',
        password : 'vk-events-password',
        database : 'vk-events'
    })

db.connect()

const methodModules = {
    auth: require('./modules/auth')(vk, db),
    session: {
        get: require('./modules/sessionGet')(vk, db)
    },
    data: {
        getAudio: require('./modules/dataGetAudio')(vk, db),
        getVideo: require('./modules/dataGetVideo')(vk, db)
    },
    messages: {
        getDialogs: require('./modules/messagesGetDialogs')(vk, db),
        getDialogById: require('./modules/messagesGetDialogById')(vk, db),
        send: require('./modules/messagesSend')(vk, db)
    },
    events: {
        get: require('./modules/eventsGet')(vk, db)
    },
    userd: {
        check: require('./modules/usersCheck')(vk, db),
    }
}

vk.client_id = 6227861
vk.client_secret = 'NqAVwWrAiBPP8VVke5nA'
vk.redirect_uri = 'http://vk-events.lumanov.ru:8011/auth'

app.get('/auth', methodModules.auth)

app.get('/method/session.get', methodModules.session.get)
app.get('/method/data.getAudio', methodModules.data.getAudio)
app.get('/method/data.getVideo', methodModules.data.getVideo)

app.get('/method/messages.getDialogs', methodModules.messages.getDialogs)
app.get('/method/messages.getDialogById', methodModules.messages.getDialogById)
app.get('/method/messages.send', methodModules.messages.send)

app.get('/method/events.get', methodModules.events.get)

app.listen(8011)