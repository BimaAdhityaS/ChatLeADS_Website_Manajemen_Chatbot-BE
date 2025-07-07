const {Router} = require('express');
const route = Router();
const userController = require('../controllers/userController');
const auth = require('../helpers/auth');

//Manual untuk SUPER ADMIN
route.post('/api/auth/register', userController.register);

route.post('/api/auth/invite', auth, userController.inviteUser); //Invite User

route.post('/api/auth/activation', userController.activate);
route.post('/api/auth/login', userController.signing);
route.post("/api/auth/access", userController.access);
route.post("/api/auth/forgot", userController.forgot); //Forgot Password & Create New Password

route.patch("/api/auth/account", auth, userController.updateAccount)
route.patch("/api/auth/password", auth, userController.changePassword); // Change Password confirm on old password

route.delete("/api/auth/delete", auth, userController.deleteUser);// Delete user

route.get("/api/auth/account", auth, userController.accountInfo); //Get current user info
route.get("/api/auth/user", auth, userController.getAllUser); //Get All User
route.get("/api/auth/logout", userController.signOut);

module.exports = route;