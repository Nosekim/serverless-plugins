"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

var _lambda = require("serverless-offline/lambda");

var _lambda2 = _interopRequireDefault(_lambda);

var _sqs = require("./sqs");

var _sqs2 = _interopRequireDefault(_sqs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var OFFLINE_OPTION = "serverless-offline";
var CUSTOM_OPTION = "serverless-offline-sqs";

var SERVER_SHUTDOWN_TIMEOUT = 5000;

var defaultOptions = {
  batchSize: 100,
  startingPosition: "TRIM_HORIZON",
  autoCreate: false,

  accountId: "000000000000"
};

var omitUndefined = (0, _lodash.omitBy)(_lodash.isUndefined);

var ServerlessOfflineSQS = function () {
  function ServerlessOfflineSQS(serverless, cliOptions) {
    _classCallCheck(this, ServerlessOfflineSQS);

    this.cliOptions = null;
    this.options = null;
    this.sqs = null;
    this.lambda = null;
    this.serverless = null;

    this.cliOptions = cliOptions;
    this.serverless = serverless;

    // setLog((...args) => serverless.cli.log(...args));

    this.hooks = {
      "offline:start:init": this.start.bind(this),
      "offline:start:ready": this.ready.bind(this),
      "offline:start": this._startWithExplicitEnd.bind(this),
      "offline:start:end": this.end.bind(this)
    };
  }

  _createClass(ServerlessOfflineSQS, [{
    key: "start",
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _getEvents2, sqsEvents, lambdas, eventModules;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                process.env.IS_OFFLINE = true;

                this._mergeOptions();

                _getEvents2 = this._getEvents(), sqsEvents = _getEvents2.sqsEvents, lambdas = _getEvents2.lambdas;


                this._createLambda(lambdas);

                eventModules = [];


                if (sqsEvents.length > 0) {
                  eventModules.push(this._createSqs(sqsEvents));
                }

                _context.next = 8;
                return Promise.all(eventModules);

              case 8:

                console.log("Starting Offline SQS: " + this.options.stage + "/" + this.options.region + ".");

              case 9:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function start() {
        return _ref.apply(this, arguments);
      }

      return start;
    }()
  }, {
    key: "ready",
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!(process.env.NODE_ENV !== "test")) {
                  _context2.next = 3;
                  break;
                }

                _context2.next = 3;
                return this._listenForTermination();

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function ready() {
        return _ref2.apply(this, arguments);
      }

      return ready;
    }()

    // eslint-disable-next-line class-methods-use-this

  }, {
    key: "_listenForTermination",
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var command;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return new Promise(function (resolve) {
                  process.on("SIGINT", function () {
                    return resolve("SIGINT");
                  }).on("SIGTERM", function () {
                    return resolve("SIGTERM");
                  });
                });

              case 2:
                command = _context3.sent;


                console.log("Got " + command + " signal. Offline Halting...");

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function _listenForTermination() {
        return _ref3.apply(this, arguments);
      }

      return _listenForTermination;
    }()
  }, {
    key: "_startWithExplicitEnd",
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.start();

              case 2:
                _context4.next = 4;
                return this.ready();

              case 4:
                this.end();

              case 5:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function _startWithExplicitEnd() {
        return _ref4.apply(this, arguments);
      }

      return _startWithExplicitEnd;
    }()
  }, {
    key: "end",
    value: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(skipExit) {
        var eventModules;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (!(process.env.NODE_ENV === "test" && skipExit === undefined)) {
                  _context5.next = 2;
                  break;
                }

                return _context5.abrupt("return");

              case 2:

                console.log("Halting offline server");

                eventModules = [];


                if (this.lambda) {
                  eventModules.push(this.lambda.cleanup());
                }

                if (this.sqs) {
                  eventModules.push(this.sqs.stop(SERVER_SHUTDOWN_TIMEOUT));
                }

                _context5.next = 8;
                return Promise.all(eventModules);

              case 8:

                if (!skipExit) {
                  process.exit(0);
                }

              case 9:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function end(_x) {
        return _ref5.apply(this, arguments);
      }

      return end;
    }()
  }, {
    key: "_createLambda",
    value: function _createLambda(lambdas) {
      this.lambda = new _lambda2.default(this.serverless, this.options);
      this.lambda.create(lambdas);
    }
  }, {
    key: "_createSqs",
    value: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(events, skipStart) {
        var resources;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                resources = this._getResources();


                this.sqs = new _sqs2.default(this.lambda, resources, this.options);

                _context6.next = 4;
                return this.sqs.create(events);

              case 4:
                if (skipStart) {
                  _context6.next = 7;
                  break;
                }

                _context6.next = 7;
                return this.sqs.start();

              case 7:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function _createSqs(_x2, _x3) {
        return _ref6.apply(this, arguments);
      }

      return _createSqs;
    }()
  }, {
    key: "_mergeOptions",
    value: function _mergeOptions() {
      var _serverless$service = this.serverless.service,
          _serverless$service$c = _serverless$service.custom,
          custom = _serverless$service$c === undefined ? {} : _serverless$service$c,
          provider = _serverless$service.provider;


      var offlineOptions = custom[OFFLINE_OPTION];
      var customOptions = custom[CUSTOM_OPTION];

      this.options = Object.assign({}, omitUndefined(defaultOptions), omitUndefined(provider), omitUndefined((0, _lodash.pick)("location", offlineOptions)), // serverless-webpack support
      omitUndefined(customOptions), omitUndefined(this.cliOptions));

      // debugLog('options:', this.options);
    }
  }, {
    key: "_getEvents",
    value: function _getEvents() {
      var _this = this;

      var service = this.serverless.service;


      var lambdas = [];
      var sqsEvents = [];

      var functionKeys = service.getAllFunctions();

      functionKeys.forEach(function (functionKey) {
        var functionDefinition = service.getFunction(functionKey);

        lambdas.push({ functionKey: functionKey, functionDefinition: functionDefinition });

        var events = service.getAllEventsInFunction(functionKey) || [];

        events.forEach(function (event) {
          var _resolveFn2 = _this._resolveFn(event),
              sqs = _resolveFn2.sqs;

          if (sqs && functionDefinition.handler) {
            sqsEvents.push({
              functionKey: functionKey,
              handler: functionDefinition.handler,
              sqs: sqs
            });
          }
        });
      });

      return {
        sqsEvents: sqsEvents,
        lambdas: lambdas
      };
    }
  }, {
    key: "_resolveFn",
    value: function _resolveFn(obj) {
      var _this2 = this;

      var Resources = (0, _lodash.get)(["service", "resources", "Resources"], this.serverless);

      return (0, _lodash.pipe)(_lodash.toPairs, (0, _lodash.map)(function (_ref7) {
        var _ref8 = _slicedToArray(_ref7, 2),
            key = _ref8[0],
            value = _ref8[1];

        if (!(0, _lodash.isPlainObject)(value)) return [key, value];

        if ((0, _lodash.has)("Fn::GetAtt", value)) {
          var _value$FnGetAtt = _slicedToArray(value["Fn::GetAtt"], 2),
              resourceName = _value$FnGetAtt[0],
              attribute = _value$FnGetAtt[1];

          switch (attribute) {
            case "Arn":
              {
                var type = (0, _lodash.get)([resourceName, "Type"], Resources);

                switch (type) {
                  case "AWS::SQS::Queue":
                    {
                      var queueName = (0, _lodash.get)([resourceName, "Properties", "QueueName"], Resources);
                      return [key, "arn:aws:sqs:" + _this2.options.region + ":" + _this2.options.accountId + ":" + queueName];
                    }
                  default:
                    {
                      return null;
                    }
                }
              }
            default:
              {
                return null;
              }
          }
        }
        return [key, _this2._resolveFn(value)];
      }), _lodash.compact, _lodash.fromPairs)(obj);
    }
  }, {
    key: "_getResources",
    value: function _getResources() {
      var Resources = (0, _lodash.get)(["service", "resources", "Resources"], this.serverless);
      return this._resolveFn(Resources);
    }
  }]);

  return ServerlessOfflineSQS;
}();

// module.exports = ServerlessOfflineSQS;


exports.default = ServerlessOfflineSQS;