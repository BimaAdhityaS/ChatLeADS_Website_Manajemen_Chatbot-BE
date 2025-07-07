const {Schema, model} = require('mongoose');

const userSchema = new Schema(
    {
        name :{
            type: String,
            required: [true, "tolong masukkan nama anda!"],
            trim: true
        },
        email :{
            type: String,
            required: [true, "Tolong massukan email anda!"],
            unique: true,
            trim: true
        },
        password :{
            type: String,
            required: [true, "Tolong masukkan password anda!"],
            min: 8
        },
        isVerified :{
            type: Boolean,
            default: false
        },
        role :{
            type: String,
            enum: ['SUPER ADMIN', 'ADMIN'],
            default: 'SUPER ADMIN'
        }
    }, {timestamps: true}
)

const User = model('User', userSchema);

module.exports = User;