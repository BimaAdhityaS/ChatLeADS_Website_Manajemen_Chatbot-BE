const {Schema, model} = require('mongoose');

const riwayatPelatihanSchema = new Schema(
    {
        userName :{
            type: String,
        },
        role :{
            type: String,
            enum: ['SUPER ADMIN', 'ADMIN'],
        },
        status :{
            type: String,
            enum: ['SUKSES', 'GAGAL'],
        },
        durasiPelatihan :{
            type: String,
        }
    }, {timestamps: true}
)

const RiwayatPelatihan = model('RiwayatPelatihan', riwayatPelatihanSchema);

module.exports = RiwayatPelatihan;