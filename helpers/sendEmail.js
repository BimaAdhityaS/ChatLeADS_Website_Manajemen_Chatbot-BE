const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const { OAuth2 } = google.auth;
const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground';

require('dotenv').config();

const {
    G_CLIENT_ID,
    G_CLIENT_SECRET,
    G_REFRESH_TOKEN,
    ADMIN_EMAIL
} = process.env;

const oauth2Client = new OAuth2(
    G_CLIENT_ID,
    G_CLIENT_SECRET,
    G_REFRESH_TOKEN,
    OAUTH_PLAYGROUND
);

const sendEmailRegister = (to,url, text) => {
    oauth2Client.setCredentials({
        refresh_token: G_REFRESH_TOKEN
    });

    const accessToken = oauth2Client.getAccessToken();
    const smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: ADMIN_EMAIL,
            clientId: G_CLIENT_ID,
            clientSecret: G_CLIENT_SECRET,
            refreshToken: G_REFRESH_TOKEN,
            accessToken
        }
    });

    const mailOptions = {
        from: ADMIN_EMAIL,
        to: to,
        subject: 'Aktivasi Akun',
        html: `
            <h1>Silahkan klik link dibawah ini untuk mengaktifkan akun anda</h1>
            <p>${text}</p>
            <a href=${url}>${url}</a>
        `
    };

    smtpTransport.sendMail(mailOptions, (err, infor) => {
        if(err) return err;
        return infor;
    });
};

module.exports = { sendEmailRegister };