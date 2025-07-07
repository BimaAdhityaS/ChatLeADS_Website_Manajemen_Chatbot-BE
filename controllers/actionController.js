const Action = require('../models/actionModel');
const Rule = require('../models/ruleModel');
const Story = require('../models/storyModel');
const { cloudinary } = require('../config/cloudinary');

const actionController = {
    getAllAction: async (req, res) => {
        try {
            const actions = await Action.find();
            res.json(actions);
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },

    getActionById: async (req, res) => {
        try {
            const action = await Action.findById(req.params.id);
            if (!action) return res.status(400).json({ msg: "Action tidak ditemukan." });
            res.json(action);
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },

    createAction: async (req, res) => {
        try {
            const { action, type, response, url } = req.body;

            if (!action) return res.status(400).json({ msg: "Nama action tidak boleh kosong." });

            // Check for unique action name
            const existingAction = await Action.findOne({ action });
            if (existingAction) return res.status(400).json({ msg: "Nama action harus unik" });

            let newUrl = url;
            let newUrlId = "";

            if (type !== "url") {
                if (!req.file) return res.status(400).json({ msg: "File tidak boleh kosong." });

                newUrl = req.file.path;
                newUrlId = req.file.filename;
            } else if (!url) {
                return res.status(400).json({ msg: "URL tidak boleh kosong." });
            }

            // Save action to database
            const newAction = new Action({ action, type, response, url: newUrl, url_id: newUrlId });
            await newAction.save();

            res.json({ msg: "Action berhasil ditambahkan.", data: newAction });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },

    updateAction: async (req, res) => {
        try {
            const { id } = req.params;
            const { action, type, response, url } = req.body;

            const existingAction = await Action.findById(id);
            if (!existingAction) return res.status(404).json({ msg: "Action tidak ditemukan" });

            // Ensure action names remain unique
            const existingNameAction = await Action.findOne({ action });
            if (existingNameAction && existingNameAction._id.toString() !== id) {
                return res.status(400).json({ msg: "Nama action harus unik." });
            }

            let newUrl = existingAction.url;
            let newUrlId = existingAction.url_id;

            if (type === "url") {
                if (!url) return res.status(400).json({ msg: "URL tidak boleh kosong." });

                newUrl = url;
                newUrlId = ""; // No Cloudinary file
            } else if (req.file) {
                if (existingAction.url_id) {
                    const publicId = existingAction.url_id;
                    const options = {};
    
                    // if this action.type === "video", override:
                    if (action.type === "video") {
                        options.resource_type = "video";
                    }
    
                    try {
                        const result = await cloudinary.uploader.destroy(publicId, options);
                    } catch (err) {
                        console.error("Cloudinary destroy error:", err);
                        // you can still proceed to delete the DB record, or return an error
                    }
                }

                newUrl = req.file.path;
                newUrlId = req.file.filename;
            }

            existingAction.action = action || existingAction.action;
            existingAction.type = type || existingAction.type;
            existingAction.response = response || existingAction.response;
            existingAction.url = newUrl;
            existingAction.url_id = newUrlId;

            await existingAction.save();
            res.json({ msg: "Action berhasil diperbarui.", data: existingAction });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },

    deleteAction: async (req, res) => {
        try {
            const { id } = req.params;

            // Check if the action exists
            const action = await Action.findById(id);
            if (!action) {
                return res.status(404).json({ msg: "Action tidak ditemukan" });
            }

            // Check if action is used in any rule
            const rulesUsingAction = await Rule.find(
                { steps: { $elemMatch: { type: 'action', value: id, refModel: 'Action' } } },
                'name'
            );

            // Check if action is used in any story
            const storiesUsingAction = await Story.find(
                { steps: { $elemMatch: { type: 'action', value: id, refModel: 'Action' } } },
                'name'
            );

            if (rulesUsingAction.length > 0 || storiesUsingAction.length > 0) {
                const ruleNames = rulesUsingAction.map(rule => rule.name);
                const storyNames = storiesUsingAction.map(story => story.name);

                return res.status(400).json({
                    name: action.action,
                    msg: `${action.action} masih ada dalam urutan percakapan tolong diubah atau dihapus.`,
                    rules: ruleNames,
                    stories: storyNames
                });
            }

            if (action.url_id) {
                const publicId = action.url_id;
                const options = {};

                // if this action.type === "video", override:
                if (action.type === "video") {
                    options.resource_type = "video";
                }

                try {
                    const result = await cloudinary.uploader.destroy(publicId, options);
                } catch (err) {
                    console.error("Cloudinary destroy error:", err);
                    // you can still proceed to delete the DB record, or return an error
                }
            }

            await action.deleteOne();
            res.json({ msg: "Action berhasil dihapus." });

        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    }
};

module.exports = actionController;
