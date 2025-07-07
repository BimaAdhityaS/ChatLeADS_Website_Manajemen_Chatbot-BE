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

const sendEmailInvitation = (to, url, password, name) => {
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
        subject: 'ChatLeADS - Undangan Sebagai Admin',
        html: `
            <div
        style="font-family: Arial, sans-serif; background: linear-gradient(to bottom, #007bff, #a3d8f4); padding: 40px 20px;">
        <div
            style="max-width: 600px; margin: auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.1); text-align: center;">
            <img src="https://res.cloudinary.com/drood0vmn/image/upload/v1745926596/Logo_Making-removebg-preview_2_zu2o88.png"
                alt="ChatLeADS Logo" style="width: 120px; margin-bottom: 4px;">
            <h1 style="color: #007bff; margin-bottom: 12px;">ChatLeADS - Undangan</h1>

            <p style="font-size: 16px; color: #555; text-align: center;">
                Halo, <strong>${name}</strong>
            </p>

            <p style="font-size: 16px; color: #555;">
                Anda telah diundang untuk bergabung sebagai Admin di <br><b>ChatLeADS</b> - Layanan Bantuan Informasi
                Chatbot LMS LeADS UPNVJ.
            </p>

            <p style="font-size: 16px; color: #555;">Berikut adalah informasi akun Anda:</p>

            <div
                style="background-color: #f1f1f1; border: 1px dashed #ccc; border-radius: 6px; padding: 16px; margin: 20px auto; text-align: left; max-width: 400px;">
                <p style="margin: 8px 0;"><strong>Email:</strong> ${to}</p>
                <p style="margin: 8px 0;"><strong>Password:</strong> ${password}</p>
            </div>

            <p style="font-size: 16px; color: #555;">
                Untuk memulai, silakan klik tombol di bawah ini untuk mengaktifkan akun Anda:
            </p>

            <a href="${url}"
                style="display: inline-block; padding: 12px; font-size: 16px; color: white; background-color: #007bff; text-decoration: none; border-radius: 5px;">
                Aktivasi Akun
            </a>

            <p style="font-size: 14px; color: #888; margin-top: 12px;">
                @ChatLeADS - Chatbot Layanan Bantuan Informasi LeADS UPNVJ
            </p>
        </div>
    </div>
        `
    };

    smtpTransport.sendMail(mailOptions, (err, infor) => {
        if (err) return err;
        return infor;
    });
};

module.exports = { sendEmailInvitation };