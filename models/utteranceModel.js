const {Schema, model} = require('mongoose');

const utteranceSchema = new Schema(
    {
        utterance:{
            type: String,
            required: [true, "Tolong masukkan nama utterance."]
        },
        response:{
            type: String,
            required: [true, "Tolong masukkan response text."]
        }
    }, {timestamps: true}
)

const Utterance = model('Utterance', utteranceSchema);

module.exports = Utterance;