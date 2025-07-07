const Story = require('../models/storyModel');
const mongoose = require('mongoose');

const storyController = {
    getAllStory: async (req, res) => {
        try {
            const stories = await Story.find()
                .populate({
                    path: 'steps.value',
                    populate: { path: '_id' },
                });
            res.json(stories);
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },

    getStoryById: async (req, res) => {
        try {
            const story = await Story.findById(req.params.id)
                .populate({
                    path: 'steps.value',
                    populate: { path: '_id' },
                });

            if (!story) return res.status(404).json({ msg: 'Story tidak ditemukan.' });
            res.json(story);
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },

    createStory: async (req, res) => {
        try {
            const { name, steps } = req.body;

            //Name must be unique
            const existingStory = await Story.findOne({ name });
            if (existingStory) return res.status(400).json({ msg: 'Nama story harus unik.' });

            // Validate steps
            if (!steps || steps.length === 0) {
                return res.status(400).json({ msg: 'Urutan percakapan tidak boleh kosong.' });
            }

            // Validate each step
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


            const newStory = new Story({ name, steps });
            await newStory.save();

            res.status(201).json({ msg: 'Story berhasil dibuat.' });
        } catch (err) {
            res.status(400).json({ msg: err.message });
        }
    },

    updateStory: async (req, res) => {
        try {
            const { name, steps } = req.body;

            //Name must be unique
            if (name) {
                const existingStory = await Story.findOne({ name, _id: { $ne: req.params.id } });
                if (existingStory) return res.status(400).json({ msg: 'Nama story harus unik.' });
            }

            const updatedStory = await Story.findByIdAndUpdate(
                req.params.id,
                { ...(name && { name }), ...(steps && { steps }) },
                { new: true, runValidators: true }
            );

            if (!updatedStory) return res.status(404).json({ msg: 'Story tidak ditemukan.' });

            res.json({ msg: 'Story berhasil diperbarui.' });
        } catch (err) {
            res.status(400).json({ msg: err.message });
        }
    },

    deleteStory: async (req, res) => {
        try {
            const deletedStory = await Story.findByIdAndDelete(req.params.id);
            if (!deletedStory) return res.status(404).json({ msg: 'Story tidak ditemukan.' });

            res.json({ msg: 'Story berhasil dihapus.' });
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    }
}

module.exports = storyController;