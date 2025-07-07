const mongoose = require('mongoose');
const atlasConnection = require('../helpers/connectAtlas');

const conversationSchema = new mongoose.Schema(
    {
        sender_id: { type: String, required: true }, // ID of the user interacting with the chatbot
        active_loop: { type: Object }, // Object storing the active loop state
        events: { type: Array, default: [] }, // Array of events during the conversation
        followup_action: { type: String, default: null }, // Follow-up action name (null if none)
        latest_action: { type: Object }, // Object storing details of the latest action
        latest_action_name: { type: String }, // Name of the latest action
        latest_event_time: { type: Number }, // Unix timestamp of the latest event
        latest_input_channel: { type: String }, // Input channel (e.g., "telegram")
        latest_message: { type: Object }, // Object storing the latest user message
        paused: { type: Boolean, default: false }, // Whether the conversation is paused
        slots: { type: Object }, // Object storing the current slot values
    }, { collection: 'conversations' }
)

const Conversation = atlasConnection.model('Conversation', conversationSchema);
module.exports = Conversation;