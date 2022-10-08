"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _lodash = require("lodash");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var extractQueueNameFromARN = function extractQueueNameFromARN(arn) {
  var _arn$split = arn.split(":"),
      _arn$split2 = _slicedToArray(_arn$split, 6),
      queueName = _arn$split2[5];

  return queueName;
};

var SQSEventDefinition = function SQSEventDefinition(rawSqsEventDefinition, region, accountId) {
  _classCallCheck(this, SQSEventDefinition);

  var enabled = void 0;
  var queueName = void 0;

  if (typeof rawSqsEventDefinition === "string") {
    queueName = extractQueueNameFromARN(rawSqsEventDefinition);
  } else if (typeof rawSqsEventDefinition.arn === "string") {
    queueName = extractQueueNameFromARN(rawSqsEventDefinition.arn);
  } else if (typeof rawSqsEventDefinition.queueName === "string") {
    queueName = rawSqsEventDefinition.queueName;
  }

  this.enabled = (0, _lodash.isNil)(enabled) ? true : enabled;

  this.arn = "arn:aws:sqs:" + region + ":" + accountId + ":" + queueName;
  this.queueName = queueName;

  if (typeof rawSqsEventDefinition !== "string") {
    Object.assign(this, (0, _lodash.omit)(["arn", "queueName", "enabled"], rawSqsEventDefinition));
  }
};

// module.exports = SQSEventDefinition;


exports.default = SQSEventDefinition;