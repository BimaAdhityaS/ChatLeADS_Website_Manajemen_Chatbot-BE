const mongoose = require('mongoose');
const Intent = mongoose.model('Intent');
const Action = mongoose.model('Action');
const Utterance = mongoose.model('Utterance');
const Tracker = mongoose.model('Tracker');
const TrackerAtlas = require('../models/TrackerModelAtlas');
const Rule = mongoose.model('Rule');
const Story = mongoose.model('Story');

const dashboardController = {
    getDashboardData: async (req, res) => {
        try {
            const [intents, actions, utterances, trackers, rules, stories] = await Promise.all([
                Intent.find().lean(),
                Action.find().lean(),
                Utterance.find().lean(),
                Tracker.find().lean(),
                Rule.find().lean(),
                Story.find().lean()
            ]);

            // Categorize trackers and count by category
            const categorizedTrackers = trackers
                .map(tracker => {
                    const hasFallback = tracker.events.some(
                        event => event.event === "action" && event.name === "action_default_fallback"
                    );
                    return {
                        _id: tracker._id,
                        sender_id: tracker.sender_id,
                        category: hasFallback ? "Fallback" : "Normal"
                    };
                })
                .sort((a, b) => new Date(b._id.getTimestamp()) - new Date(a._id.getTimestamp()));

            // Count trackers by category
            const trackerStats = categorizedTrackers.reduce((acc, tracker) => {
                acc[tracker.category] = (acc[tracker.category] || 0) + 1;
                return acc;
            }, {});

            // Calculate total sum of all examples
            const totalExamples = intents.reduce((sum, intent) => sum + intent.examples.length, 0);

            // Count action events by name across all trackers
            const actionCounts = trackers.reduce((acc, tracker) => {
                tracker.events.forEach(event => {
                    if (event.event === "action" && event.name) {
                        acc[event.name] = (acc[event.name] || 0) + 1;
                    }
                });
                return acc;
            }, {});

            // Convert to array format, filter out unwanted actions, and sort
            const actionStats = Object.entries(actionCounts)
                .filter(([name]) => !['action_listen', 'action_session_start', 'utter_U_Introduction','action_unlikely_intent', 'action_restart'].includes(name))
                .map(([name, count]) => ({ name: name.replace(/^utter_/, ''), count }))
                .sort((a, b) => b.count - a.count);

            return res.json({
                intent_count: intents.length,
                total_examples: totalExamples,
                utterance_count: utterances.length,
                action_count: actions.length,
                dialog_count: rules.length + stories.length,
                tracker_count: trackers.length,
                tracker_stats: trackerStats,  // Added tracker statistics by category
                action_stats: actionStats,
                categorized_trackers: categorizedTrackers  // Optional: include full categorized list
            });
        } catch (err) {
            console.error('getDashboardData error:', err);
            return res.status(500).json({ msg: err.message });
        }
    },

    getDashboardDataAtlas: async (req, res) => {
        try {
            const [intents, actions, utterances, trackers, rules, stories] = await Promise.all([
                Intent.find().lean(),
                Action.find().lean(),
                Utterance.find().lean(),
                TrackerAtlas.find().lean(),
                Rule.find().lean(),
                Story.find().lean()
            ]);

            // Categorize trackers and count by category
            const categorizedTrackers = trackers
                .map(tracker => {
                    const hasFallback = tracker.events.some(
                        event => event.event === "action" && event.name === "action_default_fallback"
                    );
                    return {
                        _id: tracker._id,
                        sender_id: tracker.sender_id,
                        category: hasFallback ? "Fallback" : "Normal"
                    };
                })
                .sort((a, b) => new Date(b._id.getTimestamp()) - new Date(a._id.getTimestamp()));

            // Count trackers by category
            const trackerStats = categorizedTrackers.reduce((acc, tracker) => {
                acc[tracker.category] = (acc[tracker.category] || 0) + 1;
                return acc;
            }, {});

            // Calculate total sum of all examples
            const totalExamples = intents.reduce((sum, intent) => sum + intent.examples.length, 0);

            // Count action events by name across all trackers
            const actionCounts = trackers.reduce((acc, tracker) => {
                tracker.events.forEach(event => {
                    if (event.event === "action" && event.name) {
                        acc[event.name] = (acc[event.name] || 0) + 1;
                    }
                });
                return acc;
            }, {});

            // Convert to array format, filter out unwanted actions, and sort
            const actionStats = Object.entries(actionCounts)
                .filter(([name]) => !['action_listen', 'action_session_start', 'utter_U_Introduction','action_unlikely_intent', 'action_restart'].includes(name))
                .map(([name, count]) => ({ name: name.replace(/^utter_/, ''), count }))
                .sort((a, b) => b.count - a.count);

            return res.json({
                intent_count: intents.length,
                total_examples: totalExamples,
                utterance_count: utterances.length,
                action_count: actions.length,
                dialog_count: rules.length + stories.length,
                tracker_count: trackers.length,
                tracker_stats: trackerStats,  // Added tracker statistics by category
                action_stats: actionStats,
                categorized_trackers: categorizedTrackers  // Optional: include full categorized list
            });
        } catch (err) {
            console.error('getDashboardData error:', err);
            return res.status(500).json({ msg: err.message });
        }
    }
}

module.exports = dashboardController;