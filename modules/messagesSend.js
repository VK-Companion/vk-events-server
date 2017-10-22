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
        
        if (!req.query.text) {
            return res.status(400).send(JSON.stringify({
                error: "Field 'text' is missing"
            }))
        }
        
        db.query('SELECT * FROM `sessions` WHERE token = ?', [req.query.token], (error, results, fields) => {
            if (error) {
                throw error
            }

            if (results) {
                if (results[0].access_token) {
                    console.log(results[0].access_token)

                    req.query.peer_id = +req.query.peer_id

                    if (isNaN(req.query.peer_id)) {
                        return res.status(400).send(JSON.stringify({
                            error: "Field 'peer_id' is invalid"
                        }))
                    }

                    if (results[0].user_id == req.query.peer_id) {
                        return res.status(400).send(JSON.stringify({
                            error: "Field 'peer_id' is invalid"
                        }))
                    }

                    let query = 'INSERT INTO `messages` SET ?', data = {
                        sender_id: results[0].user_id,
                        peer_id: req.query.peer_id,
                        text: req.query.text,
                        attachments: req.query.attachments ? req.query.attachments : ''
                    }

                    return db.query(query, data, (error, results, fields) => {
                        if (error) {
                            console.error(error)

                            return res.status(500).send(JSON.stringify({
                                error: "Server error :("
                            }))
                        }

                        return res.end(
                            JSON.stringify({
                                response: true
                            })
                        )
                    })
                }
            }
        })
    }
}