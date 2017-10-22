module.exports = (vk, db) => {

    return (req, res) => {
        if (!req.query.token) {
            return res.status(400).send(JSON.stringify({
                error: "Authorization token is missing"
            }))
        }
        
        db.query('SELECT * FROM `sessions` WHERE token = ?', [req.query.token], function (error, results, fields) {
            if (error) {
                throw error
            }

            if (results) {
                if (results[0].access_token) {
                    console.log(results[0].access_token)

                    const api = new vk.API(results[0].access_token)

                    return api.call('users.get', {
                        fields: 'photo_200,status'
                    }, (error, response) => {
                        if (error) {
                            console.log(error)

                            return res.status(400).send(JSON.stringify({
                                error: "Invalid session"
                            }))
                        }

                        res.end(JSON.stringify({
                            user_id: response[0].id,
                            first_name: response[0].first_name,
                            last_name: response[0].last_name,
                            status: response[0].status,
                            photo: response[0].photo_200
                        }))
                    })
                }
            }
                return res.status(400).send(JSON.stringify({
                    error: "Invalid session"
                }))
        })
    }
}