const {Schema, model} = require('mongoose');

const intentSchema = new Schema(
    {
        intent:{
            type: String,
            required: [true, "Tolong masukkan nama intent."]
        },
        examples:{
            type: [String],
            required: [true, "Tolong masukkan minimal 1 example."]
        }
    }, {timestamps: true}
)

const Intent = model('Intent', intentSchema);

module.exports = Intent;