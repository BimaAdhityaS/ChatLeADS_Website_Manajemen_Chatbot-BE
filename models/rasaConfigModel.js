const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema({
    tokenizer: {
        name: { type: String, default: 'WhitespaceTokenizer' },
    },
    featurizers: [
        {
            name: { type: String, required: true },
            analyzer: { type: String, default: null }, // Optional
            min_ngram: { type: Number, default: null }, // Optional
            max_ngram: { type: Number, default: null }, // Optional
        },
    ],
    dietClassifier: {
        name: { type: String, default: 'DIETClassifier' },
        epochs: { type: Number, default: 100 },
        constrain_similarities: { type: Boolean, default: true },
    },
    responseSelector: {
        name: { type: String, default: 'ResponseSelector' },
        epochs: { type: Number, default: 100 },
        constrain_similarities: { type: Boolean, default: true },
    },
    fallbackClassifier: {
        name: { type: String, default: 'FallbackClassifier' },
        threshold: { type: Number, default: 0.4 },
        ambiguity_threshold: { type: Number, default: 0.1 },
    },
    memoizationPolicy: {
        name: { type: String, default: 'MemoizationPolicy' },
        max_history: { type: Number, default: 8 },
    },
    TEDPolicy:{
        name: { type: String, default: 'TEDPolicy' },
        max_history: { type: Number, default: 8 },
        epochs: { type: Number, default: 100 },
    },
    rulePolicy:{
        name: { type: String, default: 'RulePolicy' },
        core_fallback_threshold: { type: Number, default: 0.4 },
        core_fallback_action_name: { type: String, default: 'action_default_fallback' },
        enable_fallback_prediction: { type: Boolean, default: true },
        constrain_similarities: { type: Boolean, default: true },
    },
    UnexpecTEDIntentPolicy :{
        name: { type: String, default: ' UnexpecTEDIntentPolicy' },
        max_history: { type: Number, default: 8 },
        epochs: { type: Number, default: 100 },
    }
});

module.exports = mongoose.model('ModelConfig', modelSchema);
