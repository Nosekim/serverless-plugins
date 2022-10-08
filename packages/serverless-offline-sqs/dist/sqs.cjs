"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();
// eslint-disable-next-line no-shadow

var _sqs = require("aws-sdk/clients/sqs");

var _sqs2 = _interopRequireDefault(_sqs);

var _lodash = require("lodash");

var _pQueue = require("p-queue");

var _pQueue2 = _interopRequireDefault(_pQueue);

var _sqsEventDefinition = require("./sqs-event-definition.cjs");

var _sqsEventDefinition2 = _interopRequireDefault(_sqsEventDefinition);

var _sqsEvent2 = require("./sqs-event.cjs");

var _sqsEvent3 = _interopRequireDefault(_sqsEvent2);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _asyncToGenerator(fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new Promise(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }
        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(
            function (value) {
              step("next", value);
            },
            function (err) {
              step("throw", err);
            }
          );
        }
      }
      return step("next");
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var delay = function delay(timeout) {
  return new Promise(function (resolve) {
    setTimeout(resolve, timeout);
  });
};

var SQS = (function () {
  function SQS(lambda, resources, options) {
    _classCallCheck(this, SQS);

    this.lambda = null;
    this.resources = null;
    this.options = null;

    this.lambda = lambda;
    this.resources = resources;
    this.options = options;

    this.client = new _sqs2.default(this.options);

    this.queue = new _pQueue2.default({ autoStart: false });
  }

  _createClass(SQS, [
    {
      key: "create",
      value: function create(events) {
        var _this = this;

        return Promise.all(
          events.map(function (_ref) {
            var functionKey = _ref.functionKey,
              sqs = _ref.sqs;
            return _this._create(functionKey, sqs);
          })
        );
      },
    },
    {
      key: "start",
      value: function start() {
        this.queue.start();
      },
    },
    {
      key: "stop",
      value: function stop(timeout) {
        this.queue.pause();
      },
    },
    {
      key: "_create",
      value: function _create(functionKey, rawSqsEventDefinition) {
        var sqsEvent = new _sqsEventDefinition2.default(
          rawSqsEventDefinition,
          this.options.region,
          this.options.accountId
        );

        return this._sqsEvent(functionKey, sqsEvent);
      },
    },
    {
      key: "_rewriteQueueUrl",
      value: function _rewriteQueueUrl(queueUrl) {
        if (!this.options.endpoint) return queueUrl;

        var _ref2 = new URL(this.options.endpoint),
          hostname = _ref2.hostname,
          protocol = _ref2.protocol,
          username = _ref2.username,
          password = _ref2.password,
          port = _ref2.port;

        var rewritedQueueUrl = new URL(queueUrl);
        rewritedQueueUrl.hostname = hostname;
        rewritedQueueUrl.protocol = protocol;
        rewritedQueueUrl.username = username;
        rewritedQueueUrl.password = password;
        rewritedQueueUrl.port = port;

        return rewritedQueueUrl.href;
      },
    },
    {
      key: "_getQueueUrl",
      value: (function () {
        var _ref3 = _asyncToGenerator(
          /*#__PURE__*/ regeneratorRuntime.mark(function _callee(queueName) {
            return regeneratorRuntime.wrap(
              function _callee$(_context) {
                while (1) {
                  switch ((_context.prev = _context.next)) {
                    case 0:
                      _context.prev = 0;
                      _context.next = 3;
                      return this.client
                        .getQueueUrl({ QueueName: queueName })
                        .promise();

                    case 3:
                      return _context.abrupt("return", _context.sent);

                    case 6:
                      _context.prev = 6;
                      _context.t0 = _context["catch"](0);
                      _context.next = 10;
                      return delay(10000);

                    case 10:
                      return _context.abrupt(
                        "return",
                        this._getQueueUrl(queueName)
                      );

                    case 11:
                    case "end":
                      return _context.stop();
                  }
                }
              },
              _callee,
              this,
              [[0, 6]]
            );
          })
        );

        function _getQueueUrl(_x) {
          return _ref3.apply(this, arguments);
        }

        return _getQueueUrl;
      })(),
    },
    {
      key: "_sqsEvent",
      value: (function () {
        var _ref4 = _asyncToGenerator(
          /*#__PURE__*/ regeneratorRuntime.mark(function _callee3(
            functionKey,
            sqsEvent
          ) {
            var _this2 = this;

            var enabled, arn, queueName, batchSize, QueueUrl, job;
            return regeneratorRuntime.wrap(
              function _callee3$(_context3) {
                while (1) {
                  switch ((_context3.prev = _context3.next)) {
                    case 0:
                      (enabled = sqsEvent.enabled),
                        (arn = sqsEvent.arn),
                        (queueName = sqsEvent.queueName),
                        (batchSize = sqsEvent.batchSize);

                      if (enabled) {
                        _context3.next = 3;
                        break;
                      }

                      return _context3.abrupt("return");

                    case 3:
                      if (!this.options.autoCreate) {
                        _context3.next = 6;
                        break;
                      }

                      _context3.next = 6;
                      return this._createQueue(sqsEvent);

                    case 6:
                      _context3.t0 = this;
                      _context3.next = 9;
                      return this.client
                        .getQueueUrl({ QueueName: queueName })
                        .promise();

                    case 9:
                      _context3.t1 = _context3.sent.QueueUrl;
                      QueueUrl = _context3.t0._rewriteQueueUrl.call(
                        _context3.t0,
                        _context3.t1
                      );

                      job = (function () {
                        var _ref5 = _asyncToGenerator(
                          /*#__PURE__*/ regeneratorRuntime.mark(
                            function _callee2() {
                              var _ref6, Messages, lambdaFunction, event;

                              return regeneratorRuntime.wrap(
                                function _callee2$(_context2) {
                                  while (1) {
                                    switch ((_context2.prev = _context2.next)) {
                                      case 0:
                                        _context2.next = 2;
                                        return _this2.client
                                          .receiveMessage({
                                            QueueUrl: QueueUrl,
                                            MaxNumberOfMessages: batchSize,
                                            AttributeNames: ["All"],
                                            MessageAttributeNames: ["All"],
                                            WaitTimeSeconds: 5,
                                          })
                                          .promise();

                                      case 2:
                                        _ref6 = _context2.sent;
                                        Messages = _ref6.Messages;

                                        if (!Messages) {
                                          _context2.next = 18;
                                          break;
                                        }

                                        _context2.prev = 5;
                                        lambdaFunction =
                                          _this2.lambda.get(functionKey);
                                        event = new _sqsEvent3.default(
                                          Messages,
                                          _this2.region,
                                          arn
                                        );

                                        lambdaFunction.setEvent(event);

                                        _context2.next = 11;
                                        return lambdaFunction.runHandler();

                                      case 11:
                                        _context2.next = 13;
                                        return _this2.client
                                          .deleteMessageBatch({
                                            Entries: (Messages || []).map(
                                              function (_ref7) {
                                                var Id = _ref7.MessageId,
                                                  ReceiptHandle =
                                                    _ref7.ReceiptHandle;
                                                return {
                                                  Id: Id,
                                                  ReceiptHandle: ReceiptHandle,
                                                };
                                              }
                                            ),
                                            QueueUrl: QueueUrl,
                                          })
                                          .promise();

                                      case 13:
                                        _context2.next = 18;
                                        break;

                                      case 15:
                                        _context2.prev = 15;
                                        _context2.t0 = _context2["catch"](5);

                                        console.warn(_context2.t0.stack);

                                      case 18:
                                        _this2.queue.add(job);

                                      case 19:
                                      case "end":
                                        return _context2.stop();
                                    }
                                  }
                                },
                                _callee2,
                                _this2,
                                [[5, 15]]
                              );
                            }
                          )
                        );

                        return function job() {
                          return _ref5.apply(this, arguments);
                        };
                      })();

                      this.queue.add(job);

                    case 13:
                    case "end":
                      return _context3.stop();
                  }
                }
              },
              _callee3,
              this
            );
          })
        );

        function _sqsEvent(_x2, _x3) {
          return _ref4.apply(this, arguments);
        }

        return _sqsEvent;
      })(),
    },
    {
      key: "_getResourceProperties",
      value: function _getResourceProperties(queueName) {
        return (0, _lodash.pipe)(
          _lodash.values,
          (0, _lodash.find)(
            (0, _lodash.matches)({ Properties: { QueueName: queueName } })
          ),
          (0, _lodash.get)("Properties")
        )(this.resources);
      },
    },
    {
      key: "_createQueue",
      value: (function () {
        var _ref9 = _asyncToGenerator(
          /*#__PURE__*/ regeneratorRuntime.mark(function _callee4(_ref8) {
            var queueName = _ref8.queueName;
            var remainingTry =
              arguments.length > 1 && arguments[1] !== undefined
                ? arguments[1]
                : 5;
            var properties;
            return regeneratorRuntime.wrap(
              function _callee4$(_context4) {
                while (1) {
                  switch ((_context4.prev = _context4.next)) {
                    case 0:
                      _context4.prev = 0;
                      properties = this._getResourceProperties(queueName);
                      _context4.next = 4;
                      return this.client
                        .createQueue({
                          QueueName: queueName,
                          Attributes: (0, _lodash.mapValues)(function (value) {
                            return (0, _lodash.isPlainObject)(value)
                              ? JSON.stringify(value)
                              : (0, _lodash.toString)(value);
                          }, properties),
                        })
                        .promise();

                    case 4:
                      _context4.next = 11;
                      break;

                    case 6:
                      _context4.prev = 6;
                      _context4.t0 = _context4["catch"](0);

                      if (
                        !(
                          remainingTry > 0 &&
                          _context4.t0.name ===
                            "AWS.SimpleQueueService.NonExistentQueue"
                        )
                      ) {
                        _context4.next = 10;
                        break;
                      }

                      return _context4.abrupt(
                        "return",
                        this._createQueue(
                          { queueName: queueName },
                          remainingTry - 1
                        )
                      );

                    case 10:
                      console.warn(_context4.t0.stack);

                    case 11:
                    case "end":
                      return _context4.stop();
                  }
                }
              },
              _callee4,
              this,
              [[0, 6]]
            );
          })
        );

        function _createQueue(_x5) {
          return _ref9.apply(this, arguments);
        }

        return _createQueue;
      })(),
    },
  ]);

  return SQS;
})();

//module.exports = SQS;

exports.default = SQS;
