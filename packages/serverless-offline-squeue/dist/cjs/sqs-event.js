"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
class SQSEvent {
    constructor(messages, region, arn) {
        this.Records = messages.map(({ MessageId: messageId, ReceiptHandle: receiptHandle, Body: body, Attributes: attributes, MessageAttributes: messageAttributes, MD5OfBody: md5OfBody, }) => ({
            messageId,
            receiptHandle,
            body,
            attributes,
            messageAttributes: (0, lodash_1.mapValues)((0, lodash_1.mapKeys)(lodash_1.lowerFirst), messageAttributes),
            md5OfBody,
            eventSource: "aws:sqs",
            eventSourceARN: arn,
            awsRegion: region,
        }));
    }
}
// module.exports = SQSEvent;
exports.default = SQSEvent;
