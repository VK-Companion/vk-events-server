// INSERT INTO `messages`(`sender_id`, `peer_id`, `text`, `attachments`) VALUES (2050, 2050, 'self', '')

module.exports = (vk, db) => {

    return (req, res) => {
        if (!req.query.token) {
            return res.status(400).send(JSON.stringify({
                error: "Authorization token is missing"
            }))
        }

        if (!req.query.peer_id) {
            return res.status(400).send(JSON.stringify({
                error: "Field 'peer_id' is missing"
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

                    const peer_id = +req.query.peer_id

                    if (isNaN(peer_id)) {
                        return res.status(400).send(JSON.stringify({
                            error: "Field 'peer_id' is invalid"
                        }))
                    }

                    if (results[0].user_id == req.query.peer_id) {
                        return res.status(400).send(JSON.stringify({
                            error: "Field 'peer_id' is invalid"
                        }))
                    }

                    const user_id = +results[0].user_id

                    if (isNaN(user_id)) {
                        return res.status(400).send(JSON.stringify({
                            error: "Field 'user_id' is invalid"
                        }))
                    }

                    api.call('users.get', {
                        user_ids: [user_id, peer_id].join(','),
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
                            },
                            [response[1].id]: {
                                first_name: response[1].first_name,
                                last_name: response[1].last_name,
                                photo: response[1].photo_200,
                            }
                        }

                        db.query(`SELECT * FROM \`messages\` WHERE (\`sender_id\` = ${user_id} OR \`sender_id\` = ${peer_id}) AND (\`peer_id\` = ${user_id} OR \`peer_id\` = ${peer_id}) AND (\`sender_id\` != \`peer_id\`) ORDER BY \`ts\` DESC LIMIT 30 OFFSET 0`, (error, results, fields) => {
                            if (error) {
                                throw error
                            }

                            if (results) {
                                for (const key in results) {
                                    delete results[key].id

                                    results[key].user_sender = response[results[key].sender_id]
                                    results[key].user_peer = response[results[key].peer_id]

                                    results[key].ts = results[key].ts.getTime()
                                }

                                return res.end(JSON.stringify({
                                    response: results
                                }))
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