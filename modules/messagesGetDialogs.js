module.exports = (vk, db) => {

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

                    api.call('users.get', {
                        user_ids: user_id,
                        fields: 'photo_200'
                    }, (error, response) => {
                        if (error) {
                            console.log(error)

                            return res.status(500).send(JSON.stringify({
                                error: "Server error"
                            }))
                        }

                        response = {
                            [response[0].id]: {
                                first_name: response[0].first_name,
                                last_name: response[0].last_name,
                                photo: response[0].photo_200,
                            }
                        }

                        const peer_ids = []

                        db.query(`SET sql_mode = ''; SELECT * FROM \`messages\` WHERE \`sender_id\` = ${user_id} group by peer_id ORDER BY ts DESC LIMIT 30 OFFSET 0;`, (error, results, fields) => {
                            if (error) {
                                throw error
                            }

                            if (results) {
                                results = results[1]
                                console.log(results)
                                // peer_ids
                                for (const key in results) {
                                    delete results[key].id

                                    peer_ids.push(results[key].peer_id)

                                    results[key].ts = results[key].ts.getTime()
                                }

                                api.call('users.get', {
                                    user_ids: peer_ids.join(','),
                                    fields: 'photo_200'
                                }, (error, response) => {
                                    if (error) {
                                        console.log(error)

                                        return res.status(500).send(JSON.stringify({
                                            error: "Server error"
                                        }))
                                    }

                                    const _response = response

                                    response = {}
                                    for (const o of _response) {
                                        response[o.id] = {
                                            first_name: o.first_name,
                                            last_name: o.last_name,
                                            photo: o.photo_200,
                                        }
                                    }

                                    for (const key in results) {
                                        results[key].user_peer = response[results[key].peer_id]
                                    }

                                    return res.end(JSON.stringify({
                                        response: results
                                    }))
                                })
                            } else {
                                return res.end(JSON.stringify({
                                    response: []
                                }))
                            }
                        })
                    })
                }
            }
        })
    }
}