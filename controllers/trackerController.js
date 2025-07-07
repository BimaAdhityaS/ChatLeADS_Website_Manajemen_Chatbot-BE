const Tracker = require('../models/trackerModel');

const trackerController = {
    getAll: async (req, res) => {
        try {
            const trackers = await Tracker.find();
            //send response
            res.json(trackers);
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const tracker = await Tracker.findById(req.params.id);
            //if data is not found
            if (!tracker) return res.status(400).json({ msg: "Percakapan tidak ditemukan." });
            //send response
            res.json(tracker);
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            //get the id from body
            const { sender_id } = req.body;
            //if id is empty
            if (!sender_id) return res.status(400).json({ msg: "Percakapan tidak ditemukan." });
            //delete the conversation by finding sender_Id
            await Tracker.findOneAndDelete({ sender_id });
            //send response
            res.json({ msg: "Percakapan dihapus." });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },

    deleteAll: async (req, res) => {
        try {
            //delete all conversation
            await Tracker.deleteMany();
            //send response
            res.json({ msg: "Semua percakapan dihapus." });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },

    getNormal: async(req, res) => {
        try {
            //doesnt find any action_default_fallback
            const normalConversations = await Tracker.find({
                events: {
                    $not: {
                        $elemMatch: { name: 'action_default_fallback' },
                    },
                },
            });

            //sorted by lastest_event_time
            normalConversations.sort((a, b) => {
                return new Date(b.latest_event_time) - new Date(a.latest_event_time);
            });

            res.status(200).json({
                success: true,
                data: normalConversations,
            });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },

    getFallback: async (req, res) => {
        try {
            const fallbackConversations = await Tracker.find({
                events: {
                    $elemMatch: { name: 'action_default_fallback' },
                },
            });

            //sorted by lastest_event_time ascending
            fallbackConversations.sort((a, b) => {
                return new Date(b.latest_event_time) - new Date(a.latest_event_time);
            });

            res.status(200).json({
                success: true,
                data: fallbackConversations,
            });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    }
};

module.exports = trackerController;