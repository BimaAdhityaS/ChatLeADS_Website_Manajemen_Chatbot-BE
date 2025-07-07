const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        //check ac token
        const ac_token = req.header("Authorization");
        if (!ac_token) {
            return res.status(400).json({ msg: "Access Token doesn't exist" });
        }

        //validate
        jwt.verify(ac_token, process.env.ACCESS_TOKEN, (err, user) => {
            if (err) {
                return res.status(400).json({ msg: "Authentication Failed, Try Re-Login" });
            }
            req.user = user;
            next();
        })

    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

module.exports = auth;