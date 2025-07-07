const Rule = require('../models/ruleModel');
const mongoose = require('mongoose');

const ruleController = {
    getAllRule: async (req, res) => {
        try {
            const rules = await Rule.find()
                .populate({
                    path: 'steps.value',
                    populate: { path: '_id' },
                })

            res.json(rules);
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },

    getRuleByID: async (req, res) => {
        try {
            const rule = await Rule.findById(req.params.id)
                .populate({
                    path: 'steps.value',
                    populate: { path: '_id' },
                })

            if (!rule) return res.status(404).json({ msg: 'Rule tidak ditemukan.' });
            res.json(rule);
        }
        catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },

    createRule: async (req, res) => {
        try {
            const { name, steps } = req.body;

            //Name must be unique
            const existingRule = await Rule.findOne({ name });
            if (existingRule) return res.status(400).json({ msg: "Nama rule harus unik." });

            // Validate steps
            if (!steps || steps.length === 0) {
                return res.status(400).json({ msg: "Urutan percakapan tidak boleh kosong." });
            }

            // Validate each step is it exists
            for (const step of steps) {
                if (!step.type || !step.value || !step.refModel) {
                    return res.status(400).json({ msg: 'Setiap langkah harus terisi' });
                }

                // Check if the referenced value exists
                const referencedValue = await mongoose.model(step.refModel).findById(step.value);
                if (!referencedValue) {
                    return res.status(400).json({ msg: `Nilai ${step.value} dengan referensi ${step.refModel} tidak ditemukan.` });
                }
            }

            // steps must contain atleast one intent and action
            const hasIntent = steps.some(step => step.type === 'intent');
            const hasAction = steps.some(step => step.type === 'action');

            if (!hasIntent || !hasAction) {
                return res.status(400).json({ msg: "Percakapan setidaknya harus memiliki 1 intent dan 1 action." });
            }

            const rule = new Rule({ name, steps });
            await rule.save();

            res.status(201).json({ msg: "Rule berhasil dibuat." });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    updateRule: async (req, res) => {
        try {
            const { name, steps } = req.body;

            //Name must be unique
            if (name) {
                const existingRule = await Rule.findOne({ name, _id: { $ne: req.params.id } });
                if (existingRule) {
                    return res.status(400).json({ error: "Nama rule harus unik" });
                }
            }

            const updatedRule = await Rule.findByIdAndUpdate(
                req.params.id,
                { ...(name && { name }), ...(steps && { steps }) },
                { new: true, runValidators: true }
            );

            if (!updatedRule) return res.status(404).json({ error: "Rule tidak ditemukan." });

            res.json({ msg: "Rule berhasil diperbarui." });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    deleteRule: async (req, res) => {
        try {
            const rule = await Rule.findByIdAndDelete(req.params.id);
            if (!rule) return res.status(404).json({ error: "Rule tidak ditemukan." });

            res.json({ message: "Rule berhasil dihapus" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = ruleController;