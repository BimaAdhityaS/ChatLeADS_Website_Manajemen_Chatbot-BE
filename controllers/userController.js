const { sendEmailRegister } = require('../helpers/sendEmail');
const { sendEmailForgot } = require('../helpers/sendEmailForgot');
const { sendEmailInvitation } = require('../helpers/sendEmailInvitation');
const createToken = require('../helpers/createToken');
const validateEmail = require('../helpers/validateEmail');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passwordGenerator = require('password-generator');
const User = require('../models/userModel');

const userController = {
    register: async (req, res) => {
        try {
            //get info input form
            const { name, email, password } = req.body;

            //check fields
            if (!name || !email || !password) {
                return res.status(400).json({ msg: 'Isi semua field yang kosong.' });
            }

            //check format email
            if (!validateEmail(email)) {
                return res.status(400).json({ msg: 'Email tidak valid.' });
            }
            //check user
            const user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ msg: 'Email sudah terdaftar.' });
            }

            //check password kurang dari 8
            if (password.length < 8) {
                return res.status(400).json({ msg: 'Password harus lebih dari 8 karakter.' });
            }

            //hash password
            const salt = await bcrypt.genSalt();
            const passwordHash = await bcrypt.hash(password, salt);

            //create token
            const newUser = { name, email, password: passwordHash, role: 'SUPER ADMIN' };
            const activation_token = createToken.activation(newUser);

            //send email || url jan lupa diganti
            const url = `http://localhost:3000?ac_token=${activation_token}`;
            sendEmailRegister(email, url, 'Aktivasi Akun');

            //registration sucessfull
            res.status(200).json({ msg: 'Registrasi berhasil, silahkan cek email anda untuk aktivasi akun.' });
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },

    inviteUser: async (req, res) => {
        try{
            //check user is super admin
            const curr_user = await User.findById(req.user.id)
            if (curr_user.role !== 'SUPER ADMIN') {
                return res.status(400).json({ msg: 'Akses ditolak.' });
            }
            //get user info
            const {name, email, password} = req.body;

            //check fields
            if (!name || !email || !password) {
                return res.status(400).json({ msg: 'Isi semua field yang kosong.' });
            }

            //check email format
            if (!validateEmail(email)) {
                return res.status(400).json({ msg: 'Email tidak valid.' });
            }

            //check user
            const user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ msg: 'Email sudah terdaftar.' });
            }

            //check pasword
            if (password.length < 8) {
                return res.status(400).json({ msg: 'Password harus lebih dari 8 karakter.' });
            }

            //hash password
            const salt = await bcrypt.genSalt();
            const passwordHash = await bcrypt.hash(password, salt);

            //create activation token
            const newUser = { name, email, password: passwordHash, role: 'ADMIN' };
            const activation_token = createToken.activation(newUser);

            //send email || Link jangan lupa diganti
            const url = `http://localhost:3000/?ac_token=${activation_token}`;
            sendEmailInvitation(email, url, password, name);

            //invitation successfull
            res.status(200).json({ msg: 'Undangan dikirim.' });
        }catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },

    activate: async (req, res) => {
        try {
            //get token
            const { activation_token } = req.body;

            //verify token
            const user = jwt.verify(activation_token, process.env.ACTIVATION_TOKEN);
            const { name, email, password, role } = user;

            //check user
            const check = await User.findOne({ email });
            if (check) {
                return res.status(400).json({ msg: 'Email sudah terdaftar.' });
            }

            //create new user
            const newUser = new User({ name, email, password, role , isVerified: true });
            await newUser.save();

            //activation success
            res.status(200).json({ msg: 'Aktivasi berhasil.'});
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },

    signing: async (req, res) => {
        try{
            //get credential
            const { email, password } = req.body;

            //check email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ msg: 'Email tidak terdaftar.' });
            }

            //check password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Password salah.' });
            }

            //refresh token
            const rf_token = createToken.refresh({ id: user._id });
            res.cookie("_apprftoken", rf_token,{
                httpOnly: true,
                path: '/api/auth/access',
                maxAge: 24 * 60 * 60 * 1000
            })

            //login success
            res.status(200).json({ msg: 'Login berhasil.' });

        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },

    access: async (req, res) => {
        try{
            //get rf_token
            const rf_token = req.cookies._apprftoken;
            if (!rf_token) {
                return res.status(400).json({ msg: 'Silahkan login.' });
            }

            //validate
            jwt.verify(rf_token, process.env.REFRESH_TOKEN, (err,user) => {
                if (err) {
                    return res.status(400).json({ msg: 'Silahkan login.' });
                }
                //create access token || Beda id karena ambil dari cookies
                const ac_token = createToken.access({ id: user.id });

                //access successfull
                res.status(200).json({ ac_token });
            })
        } catch {
            res.status(500).json({ msg: err.message });
        }
    },

    //forgot dan otomatis buat password
    forgot: async (req, res) => {
        try {
            //get email
            const { email } = req.body;

            //check user
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ msg: 'Email tidak terdaftar.' });
            }

            //update user password with new one
            const password = passwordGenerator(12, false);
            const salt = await bcrypt.genSalt();
            const passwordHash = await bcrypt.hash(password, salt);
            user.password = passwordHash;
            await user.save();

            //send email with the password
            const url = `http://localhost:3000/`;
            sendEmailForgot(email, url, password);
            
            //forgot successfull
            res.status(200).json({ msg: 'Periksa email anda.' });
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },

    accountInfo: async (req, res) =>{
        try{
            //get current account info -passsword
            const user = await User.findById(req.user.id).select('-password');

            //sucess
            res.status(200).json(user);
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },

    updateAccount: async (req, res) => {
        try {
            //get new info
            const { name } = req.body;

            //update
            await User.findByIdAndUpdate({ _id: req.user.id }, { name });
            
            //success
            res.status(200).json({ msg: 'Update berhasil.' });
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },

    changePassword: async (req, res) => {
        try {
            //get password info
            const { old_password, new_password } = req.body;

            //confirm old_password
            const user = await User.findById(req.user.id)
            const isMatch = await bcrypt.compare(old_password, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Password lama salah.' });
            }

            //check new password
            if (new_password.length < 8) {
                return res.status(400).json({ msg: 'Password baru harus lebih dari 8 karakter.' });
            }

            //hash new password
            const salt = await bcrypt.genSalt();
            const passwordHash = await bcrypt.hash(new_password, salt);

            //update password
            user.password = passwordHash;
            await user.save();

            //success
            res.status(200).json({ msg: 'Password berhasil diubah.' });
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },

    signOut: async (req, res) => {
        try {
            //clear cookie
            res.clearCookie("_apprftoken", { path: '/api/auth/access' });
            //success
            res.status(200).json({ msg: 'Logout berhasil.' });
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },

    getAllUser: async (req, res) => {
        try {
            //check user is super admin
            const user = await User.findById(req.user.id);
            if (user.role !== 'SUPER ADMIN') {
                return res.status(400).json({ msg: 'Akses ditolak.' });
            }

            //Display all user without the password
            const users = await User.find().select('-password');

            //display successfull
            res.status(200).json(users);
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },

    deleteUser: async (req, res) => {
        try {
            //check user is super admin
            const user = await User.findById(req.user.id);
            if (user.role !== 'SUPER ADMIN') {
                return res.status(400).json({ msg: 'Akses ditolak.' });
            }
            
            //get user id
            const { id } = req.body;

            //check if user exist
            const Deleteduser = await User.findById(id);
            if (!Deleteduser) {
                return res.status(400).json({ msg: 'User tidak ditemukan.' });
            }
            
            //Not Allowed to delete own id
            if (id === req.user.id ) {
                return res.status(400).json({ msg: 'Tidak bisa menghapus akun sendiri.' });
            }
            
            //cannot delete super admin
            if (user.role === 'SUPER ADMIN' && user.id === id) {
                return res.status(400).json({ msg: 'Tidak bisa menghapus akun SUPER ADMIN.' });
            }
            //delete user
            await User.findByIdAndDelete(id);

            //success
            res.status(200).json({ msg: 'User berhasil dihapus.' });
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = userController;