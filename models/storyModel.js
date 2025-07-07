const { Schema, model } = require('mongoose');

const storyStepSchema = new Schema({
    type: {
        type: String,
        enum: ['intent', 'action'],
        required: true
    },
    value: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'steps.refModel'
    },
    refModel: {
        type: String,
        enum: ['Intent', 'Action', 'Utterance'],
        required: true
    }
}, { _id: false });

const storySchema = new Schema({
    name: {
        type: String,
        required: [true, "Tolong masukkan nama story."]
    },
    steps: [storyStepSchema],
}, { timestamps: true });

const Story = model('Story', storySchema);
module.exports = Story;
