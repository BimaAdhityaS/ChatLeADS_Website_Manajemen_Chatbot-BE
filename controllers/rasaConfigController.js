const Config = require('../models/rasaConfigModel');

const rasaConfigController = {
    getConfig: async (req, res) => {
        try {
            let config = await Config.findOne();
            if (!config) {
                config = await Config.create({
                    tokenizer: { name: 'WhitespaceTokenizer' },
                    featurizers: [
                        { name: 'LexicalSyntacticFeaturizer' },
                        { name: 'CountVectorsFeaturizer' },
                        {
                            name: 'CountVectorsFeaturizer',
                            analyzer: 'char_wb',
                            min_ngram: 1,
                            max_ngram: 4,
                        },
                    ],
                    dietClassifier: {
                        name: 'DIETClassifier',
                        epochs: 100,
                        constrain_similarities: true,
                    },
                    responseSelector: {
                        name: 'ResponseSelector',
                        epochs: 100,
                        constrain_similarities: true,
                    },
                    fallbackClassifier: {
                        name: 'FallbackClassifier',
                        threshold: 0.4,
                        ambiguity_threshold: 0.1,
                    },
                    memoizationPolicy: {
                        name: 'MemoizationPolicy',
                        max_history: 8,
                    },
                    TEDPolicy: {
                        name: 'TEDPolicy',
                        max_history: 8,
                        epochs: 100,
                    },
                    rulePolicy: {
                        name: 'RulePolicy',
                        core_fallback_threshold: 0.4,
                        core_fallback_action_name: 'action_default_fallback',
                        enable_fallback_prediction: true,
                        constrain_similarities: true,
                    },
                    UnexpecTEDIntentPolicy: {
                        name: 'UnexpecTEDIntentPolicy',
                        max_history: 8,
                        epochs: 100,
                    },
                });
            }

            res.json(config);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    updateConfig: async (req, res) => {
        const {
            // DIET
            'dietClassifier.epochs': dietEpochs,
            'dietClassifier.constrain_similarities': dietConstrain,

            // Response Selector
            'responseSelector.epochs': responseEpochs,
            'responseSelector.constrain_similarities': responseConstrain,

            // Fallback Classifier
            'fallbackClassifier.threshold': threshold,
            'fallbackClassifier.ambiguity_threshold': ambiguity,

            // Featurizer
            'featurizers.2.min_ngram': minNgram,
            'featurizers.2.max_ngram': maxNgram,

            // MemoizationPolicy
            'memoizationPolicy.max_history': memoHistory,

            // TEDPolicy
            'TEDPolicy.max_history': tedHistory,
            'TEDPolicy.epochs': tedEpochs,

            // RulePolicy
            'rulePolicy.core_fallback_threshold': ruleThreshold,
            'rulePolicy.core_fallback_action_name': ruleFallbackAction,
            'rulePolicy.enable_fallback_prediction': ruleEnableFallback,
            'rulePolicy.constrain_similarities': ruleConstrain,

            // UnexpecTEDIntentPolicy
            'UnexpecTEDIntentPolicy.max_history': unxHistory,
            'UnexpecTEDIntentPolicy.epochs': unxEpochs,
        } = req.body;

        const updateFields = {};

        // Numbers
        if (typeof dietEpochs === 'number') updateFields['dietClassifier.epochs'] = dietEpochs;
        if (typeof responseEpochs === 'number') updateFields['responseSelector.epochs'] = responseEpochs;
        if (typeof threshold === 'number') updateFields['fallbackClassifier.threshold'] = threshold;
        if (typeof ambiguity === 'number') updateFields['fallbackClassifier.ambiguity_threshold'] = ambiguity;
        if (typeof minNgram === 'number') updateFields['featurizers.2.min_ngram'] = minNgram;
        if (typeof maxNgram === 'number') updateFields['featurizers.2.max_ngram'] = maxNgram;
        if (typeof memoHistory === 'number') updateFields['memoizationPolicy.max_history'] = memoHistory;
        if (typeof tedHistory === 'number') updateFields['TEDPolicy.max_history'] = tedHistory;
        if (typeof tedEpochs === 'number') updateFields['TEDPolicy.epochs'] = tedEpochs;
        if (typeof unxHistory === 'number') updateFields['UnexpecTEDIntentPolicy.max_history'] = unxHistory;
        if (typeof unxEpochs === 'number') updateFields['UnexpecTEDIntentPolicy.epochs'] = unxEpochs;

        // Strings
        if (typeof ruleFallbackAction === 'string') updateFields['rulePolicy.core_fallback_action_name'] = ruleFallbackAction;

        // Booleans
        if (typeof dietConstrain === 'boolean') updateFields['dietClassifier.constrain_similarities'] = dietConstrain;
        if (typeof responseConstrain === 'boolean') updateFields['responseSelector.constrain_similarities'] = responseConstrain;
        if (typeof ruleEnableFallback === 'boolean') updateFields['rulePolicy.enable_fallback_prediction'] = ruleEnableFallback;
        if (typeof ruleConstrain === 'boolean') updateFields['rulePolicy.constrain_similarities'] = ruleConstrain;

        // Number for rule policy threshold
        if (typeof ruleThreshold === 'number') updateFields['rulePolicy.core_fallback_threshold'] = ruleThreshold;

        try {
            const updatedConfig = await Config.findOneAndUpdate({}, { $set: updateFields }, { new: true });
            if (!updatedConfig) {
                return res.status(404).json({ message: 'Config not found' });
            }
            res.json(updatedConfig);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = rasaConfigController;
