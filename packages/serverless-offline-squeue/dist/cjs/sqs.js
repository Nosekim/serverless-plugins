"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqs_1 = __importDefault(require("aws-sdk/clients/sqs"));
// eslint-disable-next-line no-shadow
const lodash_1 = require("lodash");
const p_queue_1 = __importDefault(require("p-queue"));
const sqs_event_definition_1 = __importDefault(require("./sqs-event-definition"));
const sqs_event_1 = __importDefault(require("./sqs-event"));
const delay = (timeout) => new Promise((resolve) => {
    setTimeout(resolve, timeout);
});
class SQS {
    constructor(lambda, resources, options) {
        this.lambda = null;
        this.resources = null;
        this.options = null;
        this.lambda = lambda;
        this.resources = resources;
        this.options = options;
        this.client = new sqs_1.default(this.options);
        this.queue = new p_queue_1.default({ autoStart: false });
    }
    create(events) {
        return Promise.all(events.map(({ functionKey, sqs }) => this._create(functionKey, sqs)));
    }
    start() {
        this.queue.start();
    }
    stop(timeout) {
        this.queue.pause();
    }
    _create(functionKey, rawSqsEventDefinition) {
        const sqsEvent = new sqs_event_definition_1.default(rawSqsEventDefinition, this.options.region, this.options.accountId);
        return this._sqsEvent(functionKey, sqsEvent);
    }
    _rewriteQueueUrl(queueUrl) {
        if (!this.options.endpoint)
            return queueUrl;
        const { hostname, protocol, username, password, port } = new URL(this.options.endpoint);
        const rewritedQueueUrl = new URL(queueUrl);
        rewritedQueueUrl.hostname = hostname;
        rewritedQueueUrl.protocol = protocol;
        rewritedQueueUrl.username = username;
        rewritedQueueUrl.password = password;
        rewritedQueueUrl.port = port;
        return rewritedQueueUrl.href;
    }
    _getQueueUrl(queueName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.client.getQueueUrl({ QueueName: queueName }).promise();
            }
            catch (err) {
                yield delay(10000);
                return this._getQueueUrl(queueName);
            }
        });
    }
    _sqsEvent(functionKey, sqsEvent) {
        return __awaiter(this, void 0, void 0, function* () {
            const { enabled, arn, queueName, batchSize } = sqsEvent;
            if (!enabled)
                return;
            if (this.options.autoCreate)
                yield this._createQueue(sqsEvent);
            const QueueUrl = this._rewriteQueueUrl((yield this.client.getQueueUrl({ QueueName: queueName }).promise())
                .QueueUrl);
            const job = () => __awaiter(this, void 0, void 0, function* () {
                const { Messages } = yield this.client
                    .receiveMessage({
                    QueueUrl,
                    MaxNumberOfMessages: batchSize,
                    AttributeNames: ["All"],
                    MessageAttributeNames: ["All"],
                    WaitTimeSeconds: 5,
                })
                    .promise();
                if (Messages) {
                    try {
                        const lambdaFunction = this.lambda.get(functionKey);
                        const event = new sqs_event_1.default(Messages, this.region, arn);
                        lambdaFunction.setEvent(event);
                        yield lambdaFunction.runHandler();
                        yield this.client
                            .deleteMessageBatch({
                            Entries: (Messages || []).map(({ MessageId: Id, ReceiptHandle }) => ({
                                Id,
                                ReceiptHandle,
                            })),
                            QueueUrl,
                        })
                            .promise();
                    }
                    catch (err) {
                        console.warn(err.stack);
                    }
                }
                this.queue.add(job);
            });
            this.queue.add(job);
        });
    }
    _getResourceProperties(queueName) {
        return (0, lodash_1.pipe)(lodash_1.values, (0, lodash_1.find)((0, lodash_1.matches)({ Properties: { QueueName: queueName } })), (0, lodash_1.get)("Properties"))(this.resources);
    }
    _createQueue({ queueName }, remainingTry = 5) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const properties = this._getResourceProperties(queueName);
                yield this.client
                    .createQueue({
                    QueueName: queueName,
                    Attributes: (0, lodash_1.mapValues)((value) => (0, lodash_1.isPlainObject)(value) ? JSON.stringify(value) : (0, lodash_1.toString)(value), properties),
                })
                    .promise();
            }
            catch (err) {
                if (remainingTry > 0 &&
                    err.name === "AWS.SimpleQueueService.NonExistentQueue")
                    return this._createQueue({ queueName }, remainingTry - 1);
                console.warn(err.stack);
            }
        });
    }
}
//module.exports = SQS;
exports.default = SQS;
