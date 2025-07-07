const Intent = require('../models/intentModel');
const Rule = require('../models/ruleModel');
const Story = require('../models/storyModel');

const intentController = {
    // Get all intents
    getAll: async (req, res) => {
        try {
            const intents = await Intent.find();

            res.json(intents);
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },

    //Get intent by ID
    getById: async (req, res) => {
        try {
            const intent = await Intent.findById(req.params.id);

            if (!intent) return res.status(400).json({ msg: "Intent tidak ditemukan." });
            res.json(intent);
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },

    // Create new intent
    create: async (req, res) => {
        try {
            const { intent, examples } = req.body;

            //Check if the intent is empty
            if (!intent) return res.status(400).json({ msg: "Nama intent tidak boleh kosong." });

            //Check if the examples is empty
            if (examples.length === 0) return res.status(400).json({ msg: "Intent harus memiliki minimal 1 example." });

            //Check if the intent already exists
            const checkIntent = await Intent.findOne({ intent });
            if (checkIntent && checkIntent._id != req.params.id) return res.status(400).json({ msg: "Nama intent harus unik" });

            const newIntent = new Intent({
                intent,
                examples
            });

            await newIntent.save();
            res.json({ msg: "Intent berhasil ditambahkan." });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },

    // Update intent
    update: async (req, res) => {
        try {
            const { intent, examples } = req.body;

            //Check if the intent is empty
            if (!intent) return res.status(400).json({ msg: "Nama intent tidak boleh kosong." });

            //Check if the examples is empty
            if (examples.length === 0) return res.status(400).json({ msg: "Intent harus memiliki minimal 1 example." });

            //Check if the intent already exists but not the same id
            const checkIntent = await Intent.findOne({ intent });
            if (checkIntent && checkIntent._id.toString() !== req.params.id) {
                return res.status(400).json({ msg: "Nama intent harus unik." });
            }


            await Intent.findOneAndUpdate({ _id: req.params.id }, {
                intent,
                examples
            });

            res.json({ msg: "Intent berhasil diupdate." });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const intentId = req.params.id;

            // Check if the intent exists
            const intent = await Intent.findById(intentId);
            if (!intent) {
                return res.status(400).json({ msg: "Intent tidak ditemukan." });
            }

            // Find Rules that use this intent
            const rulesUsingIntent = await Rule.find({
                steps: {
                    $elemMatch: { type: 'intent', value: intentId }
                }
            }, 'name');

            // Find Stories that use this intent
            const storiesUsingIntent = await Story.find({
                steps: {
                    $elemMatch: { type: 'intent', value: intentId }
                }
            }, 'name');

            // If intent is used in either rules or stories
            if (rulesUsingIntent.length > 0 || storiesUsingIntent.length > 0) {
                const ruleNames = rulesUsingIntent.map(rule => rule.name);
                const storyNames = storiesUsingIntent.map(story => story.name);

                return res.status(412).json({
                    name: intent.intent,
                    msg: `${intent.intent} masih ada dalam urutan percakapan tolong diubah atau dihapus.`,
                    rules: ruleNames,
                    stories: storyNames
                });
            }

            // Proceed to delete
            await Intent.findByIdAndDelete(intentId);
            res.json({ msg: "Intent berhasil dihapus." });

        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    }
}

module.exports = intentController;