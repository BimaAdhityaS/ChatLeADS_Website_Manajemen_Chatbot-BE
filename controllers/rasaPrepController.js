const mongoose = require('mongoose');
const Intent = require('../models/intentModel');
const Utterance = require('../models/utteranceModel');
const Action = require('../models/actionModel');
const Rule = require('../models/ruleModel');
const Story = require('../models/storyModel');
const Config = require('../models/rasaConfigModel');
const yaml = require('js-yaml');

const rasaPrepController = {
    convertActionsAndUtterances: async (req, res, internalCall = false) => {
        try {
            const utterances = await Utterance.find();
            const actions = await Action.find();

            const utteranceResponses = utterances.map(utterance => {
                // Properly escape the response text for YAML
                const escapedResponse = utterance.response
                    .replace(/"/g, '\\"')  // Escape double quotes
                    .replace(/\n/g, '\\n') // Escape newlines
                    .replace(/\t/g, '\\t') // Escape tabs
                    .replace(/\r/g, '\\r'); // Escape carriage returns
                
                return `  utter_${utterance.utterance}:\n  - text: "${escapedResponse}"`;
            });

            const actionResponses = actions.map(action => {
                // Properly escape the response text for all action types
                const escapedResponse = action.response
                    .replace(/"/g, '\\"')
                    .replace(/\n/g, '\\n')
                    .replace(/\t/g, '\\t')
                    .replace(/\r/g, '\\r');
                
                if (action.type === 'video') {
                    return `  utter_${action.action}:\n  - text: "${escapedResponse}"\n    attachment: { "type":"video", "payload":{ "src": "${action.url}" } }`;
                } else if (action.type === 'image') {
                    return `  utter_${action.action}:\n  - text: "${escapedResponse}"\n    image: "${action.url}"`;
                } else {
                    return `  utter_${action.action}:\n  - text: "${escapedResponse}\\n\\n[Click here](${action.url})"`;
                }
            });

            const allResponses = [...utteranceResponses, ...actionResponses].join('\n\n');

            if (internalCall) return { responses: allResponses };
            return res.json({ responses: allResponses });

        } catch (error) {
            console.error("Error converting actions and utterances:", error);
            if (internalCall) throw error;
            return res.status(500).json({
                status: 'error',
                message: 'Failed to convert actions and utterances'
            });
        }
    },

    generateTrainingData: async (req, res) => {
        try {
            // Get all individual components
            const config = {
                language: 'id',
                pipeline: 'supervised_embeddings',
                policies: [
                    { name: 'MemoizationPolicy' },
                    { name: 'TEDPolicy' }
                ]
            };

            // Convert config object to YAML string
            const configYaml = `language: ${config.language}\n` +
                `pipeline: ${config.pipeline}\n` +
                `policies:\n` +
                `  - name: ${config.policies[0].name}\n` +
                `  - name: ${config.policies[1].name}`;

            // Get all other components
            const intentsRes = await rasaPrepController.convertIntents(req, res, true);
            const actionsRes = await rasaPrepController.convertActionsAndUtterances(req, res, true);
            const storiesRes = await rasaPrepController.convertStories(req, res, true);
            const rulesRes = await rasaPrepController.convertRules(req, res, true);
            const domainRes = await rasaPrepController.convertDomain(req, res, true);

            // Combine everything into a single response
            const trainingData = {
                config: configYaml,
                domain: domainRes.domain,
                nlu: intentsRes.nlu,
                responses: actionsRes.responses,
                stories: storiesRes.stories,
                rules: rulesRes.rules,
                force: false,
                save_to_default_model_directory: false
            };

            return res.json(trainingData);

        } catch (error) {
            console.error("Error generating training data:", error);
            return res.status(500).json({
                status: 'error',
                message: 'Failed to generate training data'
            });
        }
    },

    convertIntents: async (req, res, internalCall = false) => {
        try {
            const intents = await Intent.find();
            const nluExamples = intents.map(intent => {
                return `- intent: ${intent.intent}\n  examples: |\n    - ${intent.examples.join('\n    - ')}`;
            });
            const result = { nlu: nluExamples.join('\n\n') };
            return internalCall ? result : res.json(result);
        } catch (error) {
            console.error("Error converting intents:", error);
            if (internalCall) throw error;
            return res.status(500).json({ status: 'error', message: 'Failed to convert intents' });
        }
    },

    convertStories: async (req, res, internalCall = false) => {
        try {
            const stories = await Story.find().populate('steps.value');
            const rasaStories = stories.map(story => {
                const steps = story.steps.map(step => {
                    if (step.type === 'intent') {
                        return `  - intent: ${step.value.intent}`;
                    } else if (step.type === 'action') {
                        const prefix = 'utter_'
                        return `  - action: ${prefix}${step.value.utterance || step.value.action}`;
                    }
                    return '';
                }).filter(step => step !== '');
                return `- story: ${story.name}\n  steps:\n${steps.join('\n')}`;
            }).join('\n\n');
            const result = { stories: rasaStories };
            return internalCall ? result : res.json(result);
        } catch (error) {
            console.error("Error converting stories:", error);
            if (internalCall) throw error;
            return res.status(500).json({
                status: 'error',
                message: 'Failed to convert stories'
            });
        }
    },

    convertRules: async (req, res, internalCall = false) => {
        try {
            const rules = await Rule.find().populate('steps.value');
            const rasaRules = rules.map(rule => {
                const steps = rule.steps.map(step => {
                    if (step.type === 'intent') {
                        return `  - intent: ${step.value.intent}`;
                    } else if (step.type === 'action') {
                        const prefix = 'utter_'
                        return `  - action: ${prefix}${step.value.utterance || step.value.action}`;
                    }
                    return '';
                }).filter(step => step !== '');
                return `- rule: ${rule.name}\n  steps:\n${steps.join('\n')}`;
            }).join('\n\n');
            const result = { rules: rasaRules };
            return internalCall ? result : res.json(result);
        } catch (error) {
            console.error("Error converting rules:", error);
            if (internalCall) throw error;
            return res.status(500).json({
                status: 'error',
                message: 'Failed to convert rules'
            });
        }
    },

    convertDomain: async (req, res, internalCall = false) => {
        try {
            const intents = await Intent.find();
            const responseRes = await rasaPrepController.convertActionsAndUtterances(req, res, true);

            const domainIntents = intents.map(intent => `  - ${intent.intent}`).join('\n');
            const domainContent = `intents:\n${domainIntents}\n\nresponses:\n${responseRes.responses}`;

            const result = { domain: domainContent };
            return internalCall ? result : res.json(result);

        } catch (error) {
            console.error("Error generating domain content:", error);
            if (internalCall) throw error;
            return res.status(500).json({
                status: 'error',
                message: 'Failed to generate domain content'
            });
        }
    },

    getConfig: async (req, res, internalCall = false) => {
        try {
            let config = await Config.findOne();
        
            if (internalCall) {
                return config;
            }
            
            return res.json({
                status: 'success',
                data: config
            });
            
        } catch (error) {
            console.error("Error getting config:", error);
            if (internalCall) {
                throw error;
            }
            return res.status(500).json({
                status: 'error',
                message: 'Failed to get config'
            });
        }
    },

    generateYamlTrainingData: async (req, res) => {
        try {
            const intentsRes = await rasaPrepController.convertIntents(req, res, true);
            const actionsRes = await rasaPrepController.convertActionsAndUtterances(req, res, true);
            const storiesRes = await rasaPrepController.convertStories(req, res, true);
            const rulesRes = await rasaPrepController.convertRules(req, res, true);
            const configRes = await rasaPrepController.getConfig(req, res, true);

            const completeYaml = 
                `version: "3.1"
language: id
assistant_id: chatleads_agent

pipeline:
  - name: ${configRes.tokenizer.name}
  - name: ${configRes.featurizers[0].name}
  - name: ${configRes.featurizers[1].name}
  - name: ${configRes.featurizers[2].name}
    analyzer: ${configRes.featurizers[2].analyzer}
    min_ngram: ${configRes.featurizers[2].min_ngram}
    max_ngram: ${configRes.featurizers[2].max_ngram}
  - name: ${configRes.dietClassifier.name}
    epochs: ${configRes.dietClassifier.epochs}
    constrain_similarities: ${configRes.dietClassifier.constrain_similarities}
  - name: ${configRes.responseSelector.name}
    epochs: ${configRes.responseSelector.epochs}
    constrain_similarities: ${configRes.responseSelector.constrain_similarities}
  - name: ${configRes.fallbackClassifier.name}
    threshold: ${configRes.fallbackClassifier.threshold}
    ambiguity_threshold: ${configRes.fallbackClassifier.ambiguity_threshold}

policies:
  - name: MemoizationPolicy
    max_history: ${configRes.memoizationPolicy.max_history}
  - name: TEDPolicy
    max_history: ${configRes.TEDPolicy.max_history}
    epochs: ${configRes.TEDPolicy.epochs}
  - name: RulePolicy
    core_fallback_threshold: ${configRes.rulePolicy.core_fallback_threshold}
    core_fallback_action_name: "action_default_fallback"
    enable_fallback_prediction: ${configRes.rulePolicy.enable_fallback_prediction}
    constrain_similarities: ${configRes.rulePolicy.constrain_similarities}
  - name: UnexpecTEDIntentPolicy
    max_history: ${configRes.UnexpecTEDIntentPolicy.max_history}
    epochs: ${configRes.UnexpecTEDIntentPolicy.epochs}

intents:
${(await Intent.find()).map(i => `  - ${i.intent}`).join('\n')}

entities: []
slots: {}
actions: []
forms: {}
e2e_actions: []

responses:
${actionsRes.responses}

session_config:
  session_expiration_time: 60
  carry_over_slots_to_new_session: true

nlu:
${intentsRes.nlu}

rules:
- rule: Handle fallback
  steps:
  - intent: nlu_fallback
  - action: action_default_fallback
  - action: action_listen

${rulesRes.rules}

stories:
${storiesRes.stories}`;

            res.setHeader('Content-Type', 'text/yaml');
            return res.send(completeYaml);

        } catch (error) {
            console.error("Error generating YAML training data:", error);
            res.setHeader('Content-Type', 'text/yaml');
            return res.status(500).send(
                `error:
  status: error
  message: Failed to generate YAML training data
`);
        }
    }
}

module.exports = rasaPrepController;
