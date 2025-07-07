const Utterance = require('../models/utteranceModel');
const Rule = require('../models/ruleModel');
const Story = require('../models/storyModel');

const utteranceController = {
    // Get all utterances
    getAll: async (req, res) => {
        try {
            const utterances = await Utterance.find();

            res.json(utterances);
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },

    //Get utterance by ID
    getById: async (req, res) => {
        try {
            const utterance = await Utterance.findById(req.params.id);

            if (!utterance) return res.status(400).json({ msg: "Utterance tidak ditemukan." });
            res.json(utterance);
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },

    // Create new utterance
    create: async (req, res) => {
        try {
            const { utterance, response } = req.body;

            //Check if the utterance is empty
            if (!utterance) return res.status(400).json({ msg: "Nama utterance tidak boleh kosong." });

            //Check if the response is empty
            if (!response) return res.status(400).json({ msg: "Response tidak boleh kosong." });

            //check if the utterance exists
            const existingUtterance = await Utterance.findOne({ utterance });
            if (existingUtterance && existingUtterance._id != req.params.id) return res.status(400).json({ msg: "Nama utterance harus unik." });

            const newUtterance = new Utterance({
                utterance,
                response
            });

            await newUtterance.save();
            res.json({ msg: "Utterance berhasil ditambahkan." });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },

    // Update utterance
    update: async (req, res) => {
        try {
            const { utterance, response } = req.body;

            //Check if the utterance is empty
            if (!utterance) return res.status(400).json({ msg: "Nama utterance tidak boleh kosong." });

            //Check if the response is empty
            if (!response) return res.status(400).json({ msg: "Response tidak boleh kosong." });

            //check if the utterance exists but not the same id
            const checkUtterance = await Utterance.findOne({ utterance });
            if (checkUtterance && checkUtterance._id.toString() !== req.params.id) {
                return res.status(400).json({ msg: "Nama utterance harus unik." });
            }

            await Utterance.findByIdAndUpdate(req.params.id, {
                utterance,
                response
            });

            res.json({ msg: "Utterance berhasil diupdate." });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const utteranceId = req.params.id;

            // Check if the utterance exists
            const utterance = await Utterance.findById(utteranceId);
            if (!utterance) {
                return res.status(400).json({ msg: "Utterance tidak ditemukan." });
            }

            // Check if the utterance is used in any rule
            const rulesUsingUtterance = await Rule.find(
                { steps: { $elemMatch: { type: 'action', value: utteranceId, refModel: 'Utterance' } } },
                'name'
            );

            // Check if the utterance is used in any story
            const storiesUsingUtterance = await Story.find(
                { steps: { $elemMatch: { type: 'action', value: utteranceId, refModel: 'Utterance' } } },
                'name'
            );

            // If found in either
            if (rulesUsingUtterance.length > 0 || storiesUsingUtterance.length > 0) {
                const ruleNames = rulesUsingUtterance.map(rule => rule.name);
                const storyNames = storiesUsingUtterance.map(story => story.name);

                return res.status(400).json({
                    name: utterance.utterance,
                    msg: `${utterance.utterance} masih ada dalam urutan percakapan tolong diubah atau dihapus.`,
                    rules: ruleNames,
                    stories: storyNames
                });
            }

            // Proceed to delete
            await Utterance.findByIdAndDelete(utteranceId);
            res.json({ msg: "Utterance berhasil dihapus." });

        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    }
}

module.exports = utteranceController;