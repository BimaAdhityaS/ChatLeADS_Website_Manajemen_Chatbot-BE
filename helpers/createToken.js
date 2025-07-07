const jwt = require('jsonwebtoken');

//buat token semmisal 30 menit gak ada balasan email maka token akan expired
const createToken = {
    activation: (payload) => {
        return jwt.sign(payload, process.env.ACTIVATION_TOKEN, {expiresIn: '1h'});
    },

    refresh: (payload) => {
        return jwt.sign(payload, process.env.REFRESH_TOKEN, {expiresIn: '12h'});
    },

    access: (payload) => {
        return jwt.sign(payload, process.env.ACCESS_TOKEN, {expiresIn: '12h'});
    }
}

module.exports = createToken;