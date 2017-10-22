const sha256 = require('sha256')

module.exports = (vk, db) => {
    const auth = new vk.Auth
 
    return (req, res) => {
        if (!req.query.code) {
            return res.status(400).send(JSON.stringify({
                error: "Undefined field: \"code\""
            }))
        }
        

            // https://oauth.vk.com/authorize?client_id=6227861&display=page&redirect_uri=http://vk-events.lumanov.ru:8011/auth&scope=friends&response_type=code&v=5.68

            // https://oauth.vk.com/authorize?client_id=6227861&display=page&redirect_uri=http://vk-events.lumanov.ru:8011/auth&scope=5055514&response_type=code&v=5.68

        // res.end('1')
        auth.acf(vk.client_id, vk.client_secret, vk.redirect_uri, req.query.code, resp => {
            console.log(resp)

            if (resp.error) {
                console.log(resp)

                return res.end('fuck :(')
            }

            const token = sha256(JSON.stringify(resp)+Math.random())

            let query = 'INSERT INTO `sessions` SET ?', data = {
                token,
                access_token: resp.access_token,
                expires_in: resp.expires_in,
                user_id: resp.user_id
            }

            db.query(query, data, (error, results, fields) => {
                if (error) {
                    throw error
                    // console.log(error)
                }

                const api = new vk.API(resp.access_token)

                api.call('users.get', {
                    fields: 'photo_200,status'
                }, (error, response) => {
                    if (error) {
                        console.log(error)

                        return res.status(400).send(JSON.stringify({
                            error: "An error occured, try again later"
                        }))
                    }

                    res.end(JSON.stringify({
                        token,
                        expires_in: resp.expires_in,
                        user_id: response[0].id,
                        first_name: response[0].first_name,
                        last_name: response[0].last_name,
                        status: response[0].status,
                        photo: response[0].photo_200
                    }))
                })
            })
        })
    }
}