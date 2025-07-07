const { Schema, model } = require('mongoose');

const stepSchema = new Schema({
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

const ruleSchema = new Schema({
    name: {
        type: String,
        required: [true, "Tolong masukkan nama rule."]
    },
    steps: [stepSchema]
}, { timestamps: true });

const Rule = model('Rule', ruleSchema);
module.exports = Rule;
