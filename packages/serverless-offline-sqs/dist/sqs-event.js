"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require("lodash");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SQSEvent = function SQSEvent(messages, region, arn) {
  _classCallCheck(this, SQSEvent);

  this.Records = messages.map(function (_ref) {
    var messageId = _ref.MessageId,
        receiptHandle = _ref.ReceiptHandle,
        body = _ref.Body,
        attributes = _ref.Attributes,
        messageAttributes = _ref.MessageAttributes,
        md5OfBody = _ref.MD5OfBody;
    return {
      messageId: messageId,
      receiptHandle: receiptHandle,
      body: body,
      attributes: attributes,
      messageAttributes: (0, _lodash.mapValues)((0, _lodash.mapKeys)(_lodash.lowerFirst), messageAttributes),
      md5OfBody: md5OfBody,
      eventSource: "aws:sqs",
      eventSourceARN: arn,
      awsRegion: region
    };
  });
};

// module.exports = SQSEvent;


exports.default = SQSEvent;