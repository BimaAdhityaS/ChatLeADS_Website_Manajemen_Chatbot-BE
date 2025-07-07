const Rule = require('../models/ruleModel');
const Story = require('../models/storyModel');
const mongoose = require('mongoose');

const percakapanController = {
    getAllPercakapan: async (req, res) => {
        try {
            // 1. Fetch and populate rules
            const rawRules = await Rule.find().lean();
            const populatedRules = await Promise.all(
                rawRules.map(async (rule) => {
                    const steps = await Promise.all(
                        rule.steps.map(async (step) => {
                            const doc = await mongoose
                                .model(step.refModel)
                                .findById(step.value)
                                .lean();
                            return { type: step.type, refModel: step.refModel, value: doc };
                        })
                    );
                    return { id: rule._id, name: rule.name, steps, createdAt: rule.createdAt };
                })
            );

            // 2. Fetch and populate stories via refPath
            const rawStories = await Story.find().lean();
            const populatedStories = await Promise.all(
                rawStories.map(async (story) => {
                    const steps = await Promise.all(
                        story.steps.map(async (step) => {
                            // step.refModel is 'Intent'|'Action'|'Utterance'
                            const doc = await mongoose
                                .model(step.refModel)
                                .findById(step.value)
                                .lean();
                            return { type: step.type, refModel: step.refModel, value: doc };
                        })
                    );
                    return { id: story._id, name: story.name, steps, createdAt: story.createdAt };
                })
            );

            // 3. Alternate rules and stories
            const combined = [];
            const maxLen = Math.max(populatedRules.length, populatedStories.length);

            for (let i = 0; i < maxLen; i++) {
                if (populatedRules[i]) {
                    combined.push({ type: 'rule', data: populatedRules[i] });
                }
                if (populatedStories[i]) {
                    combined.push({ type: 'story', data: populatedStories[i] });
                }
            }

            // Sort ascending by createdAt (oldest first)
            combined.sort((a, b) => new Date(a.data.createdAt) - new Date(b.data.createdAt));

            // If you want newest first, just reverse it:
            combined.sort((a, b) => new Date(b.data.createdAt) - new Date(a.data.createdAt));

            return res.json({ percakapan: combined });
        } catch (err) {
            console.error('getAllPercakapan error:', err);
            return res.status(500).json({ msg: err.message });
        }
    },

    getPercakapanByIDNotPopulated: async (req, res) => {
        try {
            const { id } = req.params;
            // Validate ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ msg: 'ID tidak valid.' });
            }
            // Try to find in RuleModel first
            let percakapan = await Rule.findById(id).lean();
            // If not found in Rule, try StoryModel
            if (!percakapan) {
                percakapan = await Story.findById(id).lean();
            }
            // If still not found, return not found error
            if (!percakapan) {
                return res.status(404).json({ msg: 'Percakapan tidak ditemukan.' });
            }
            // Return the found conversation
            return res.json(percakapan);
        } catch (err) {
            console.error('getPercakapanByIDNotPopulated error:', err);
            return res.status(500).json({ msg: err.message });
        }
    }
}

module.exports = percakapanController;