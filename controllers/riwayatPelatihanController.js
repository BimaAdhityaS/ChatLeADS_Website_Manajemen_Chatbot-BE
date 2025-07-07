const RiwayatPelatihan = require('../models/riwayatTrainingModel');

const riwayatPelatihanController = {
    getAllRiwayatPelatihan: async (req, res) => {
        try {
            const riwayatPelatihan = await RiwayatPelatihan.find();
            res.json(riwayatPelatihan);
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },

    createRiwayatPelatihan: async (req, res) => {
        try {
            const { userName, role, status, durasiPelatihan } = req.body;

            const newRiwayatPelatihan = new RiwayatPelatihan({
                userName,
                role,
                status,
                durasiPelatihan
            });

            await newRiwayatPelatihan.save();
            res.json({ msg: "Riwayat pelatihan berhasil ditambahkan." });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    }
}

module.exports = riwayatPelatihanController;