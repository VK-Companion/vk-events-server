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

                    return api.call('execute.getAudio', {}, (error, response) => {
                        if (error) {
                            console.log(error)

                            return res.status(400).send(JSON.stringify({
                                error: "Invalid session"
                            }))
                        }

                        res.end(JSON.stringify(response))
                    })
                }
            }
                return res.status(400).send(JSON.stringify({
                    error: "Invalid session"
                }))
        })
    }
}