"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const extractQueueNameFromARN = (arn) => {
    const [, , , , , queueName] = arn.split(":");
    return queueName;
};
class SQSEventDefinition {
    constructor(rawSqsEventDefinition, region, accountId) {
        let enabled;
        let queueName;
        if (typeof rawSqsEventDefinition === "string") {
            queueName = extractQueueNameFromARN(rawSqsEventDefinition);
        }
        else if (typeof rawSqsEventDefinition.arn === "string") {
            queueName = extractQueueNameFromARN(rawSqsEventDefinition.arn);
        }
        else if (typeof rawSqsEventDefinition.queueName === "string") {
            queueName = rawSqsEventDefinition.queueName;
        }
        this.enabled = (0, lodash_1.isNil)(enabled) ? true : enabled;
        this.arn = `arn:aws:sqs:${region}:${accountId}:${queueName}`;
        this.queueName = queueName;
        if (typeof rawSqsEventDefinition !== "string") {
            Object.assign(this, (0, lodash_1.omit)(["arn", "queueName", "enabled"], rawSqsEventDefinition));
        }
    }
}
// module.exports = SQSEventDefinition;
exports.default = SQSEventDefinition;
