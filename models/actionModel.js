const { Schema, model } = require('mongoose');

const actionSchema = new Schema(
    {
        action: {
            type: String,
            required: [true, "Tolong masukkan nama action."]
        },
        type: {
            type: String,
            enum: ["image", "video", "url"],
            required: [true, "Tolong masukkan tipe media."]
        },
        response:{
            type: String,
        },
        url: {
            type: String,
            required: [true, "Tolong masukkan URL."]
        },
        url_id:{
            type: String
        }
    },
    { timestamps: true }
);

const Action = model('Action', actionSchema);

module.exports = Action;