const path = require('path')
const fs = require('fs')
const getColors = require('get-image-colors')
const request = require('request')

module.exports = (vk, db) => {

    const coord = [59.9451637, 30.260034]

    const latToM = cc => 111.134861111 / 1000
    const longToM = cc => 71.2403572324 / 1000

    const getDistance = (lat1, lat2, long1, long2) => {
        // Math.floor(Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(long2 - long1, 2))*1e7)/1e7

        return Math.sqrt(Math.pow((lat2 - lat1) * 111.134861111, 2) + Math.pow((long2 - long1) * 71.2403572324, 2))*1000
    }

    return (req, res) => {
        if (!req.query.token) {
            return res.status(400).send(JSON.stringify({
                error: "Authorization token is missing"
            }))
        }
        
        db.query('SELECT * FROM `sessions` WHERE token = ?', [req.query.token], (error, results, fields) => {
            if (error) {
                throw error
            }

            if (results) {
                if (results[0].access_token) {
                    console.log(results[0].access_token)

                    const api = new vk.API(results[0].access_token)

                    const user_id = +results[0].user_id

                    if (isNaN(user_id)) {
                        return res.status(400).send(JSON.stringify({
                            error: "Invalid session"
                        }))
                    }
                    db.query('SELECT DISTINCT user_id FROM `sessions` WHERE 1', (error, results, fields) => {
                        const users = []

                        for (const o of results) {
                            users.push(o.user_id)
                        }

                        return res.end(JSON.stringify({
                            response: users
                        }))
                    })
                }
            }
        })
    }
}