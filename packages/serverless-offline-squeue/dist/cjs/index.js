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
const lodash_1 = require("lodash");
const lambda_1 = __importDefault(require("serverless-offline/lambda"));
const sqs_1 = __importDefault(require("./sqs"));
const OFFLINE_OPTION = "serverless-offline";
const CUSTOM_OPTION = "serverless-offline-sqs";
const SERVER_SHUTDOWN_TIMEOUT = 5000;
const defaultOptions = {
    batchSize: 100,
    startingPosition: "TRIM_HORIZON",
    autoCreate: false,
    accountId: "000000000000",
};
const omitUndefined = (0, lodash_1.omitBy)(lodash_1.isUndefined);
class ServerlessOfflineSQS {
    constructor(serverless, cliOptions) {
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
            "offline:start:end": this.end.bind(this),
        };
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            process.env.IS_OFFLINE = true;
            this._mergeOptions();
            const { sqsEvents, lambdas } = this._getEvents();
            this._createLambda(lambdas);
            const eventModules = [];
            if (sqsEvents.length > 0) {
                eventModules.push(this._createSqs(sqsEvents));
            }
            yield Promise.all(eventModules);
            console.log(`Starting Offline SQS: ${this.options.stage}/${this.options.region}.`);
        });
    }
    ready() {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.NODE_ENV !== "test") {
                yield this._listenForTermination();
            }
        });
    }
    // eslint-disable-next-line class-methods-use-this
    _listenForTermination() {
        return __awaiter(this, void 0, void 0, function* () {
            const command = yield new Promise((resolve) => {
                process
                    .on("SIGINT", () => resolve("SIGINT"))
                    .on("SIGTERM", () => resolve("SIGTERM"));
            });
            console.log(`Got ${command} signal. Offline Halting...`);
        });
    }
    _startWithExplicitEnd() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.start();
            yield this.ready();
            this.end();
        });
    }
    end(skipExit) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.NODE_ENV === "test" && skipExit === undefined) {
                return;
            }
            console.log("Halting offline server");
            const eventModules = [];
            if (this.lambda) {
                eventModules.push(this.lambda.cleanup());
            }
            if (this.sqs) {
                eventModules.push(this.sqs.stop(SERVER_SHUTDOWN_TIMEOUT));
            }
            yield Promise.all(eventModules);
            if (!skipExit) {
                process.exit(0);
            }
        });
    }
    _createLambda(lambdas) {
        this.lambda = new lambda_1.default(this.serverless, this.options);
        this.lambda.create(lambdas);
    }
    _createSqs(events, skipStart) {
        return __awaiter(this, void 0, void 0, function* () {
            const resources = this._getResources();
            this.sqs = new sqs_1.default(this.lambda, resources, this.options);
            yield this.sqs.create(events);
            if (!skipStart) {
                yield this.sqs.start();
            }
        });
    }
    _mergeOptions() {
        const { service: { custom = {}, provider }, } = this.serverless;
        const offlineOptions = custom[OFFLINE_OPTION];
        const customOptions = custom[CUSTOM_OPTION];
        this.options = Object.assign({}, omitUndefined(defaultOptions), omitUndefined(provider), omitUndefined((0, lodash_1.pick)("location", offlineOptions)), // serverless-webpack support
        omitUndefined(customOptions), omitUndefined(this.cliOptions));
        // debugLog('options:', this.options);
    }
    _getEvents() {
        const { service } = this.serverless;
        const lambdas = [];
        const sqsEvents = [];
        const functionKeys = service.getAllFunctions();
        functionKeys.forEach((functionKey) => {
            const functionDefinition = service.getFunction(functionKey);
            lambdas.push({ functionKey, functionDefinition });
            const events = service.getAllEventsInFunction(functionKey) || [];
            events.forEach((event) => {
                const { sqs } = this._resolveFn(event);
                if (sqs && functionDefinition.handler) {
                    sqsEvents.push({
                        functionKey,
                        handler: functionDefinition.handler,
                        sqs,
                    });
                }
            });
        });
        return {
            sqsEvents,
            lambdas,
        };
    }
    _resolveFn(obj) {
        const Resources = (0, lodash_1.get)(["service", "resources", "Resources"], this.serverless);
        return (0, lodash_1.pipe)(lodash_1.toPairs, (0, lodash_1.map)(([key, value]) => {
            if (!(0, lodash_1.isPlainObject)(value))
                return [key, value];
            if ((0, lodash_1.has)("Fn::GetAtt", value)) {
                const [resourceName, attribute] = value["Fn::GetAtt"];
                switch (attribute) {
                    case "Arn": {
                        const type = (0, lodash_1.get)([resourceName, "Type"], Resources);
                        switch (type) {
                            case "AWS::SQS::Queue": {
                                const queueName = (0, lodash_1.get)([resourceName, "Properties", "QueueName"], Resources);
                                return [
                                    key,
                                    `arn:aws:sqs:${this.options.region}:${this.options.accountId}:${queueName}`,
                                ];
                            }
                            default: {
                                return null;
                            }
                        }
                    }
                    default: {
                        return null;
                    }
                }
            }
            return [key, this._resolveFn(value)];
        }), lodash_1.compact, lodash_1.fromPairs)(obj);
    }
    _getResources() {
        const Resources = (0, lodash_1.get)(["service", "resources", "Resources"], this.serverless);
        return this._resolveFn(Resources);
    }
}
//module.exports = ServerlessOfflineSQS;
exports.default = ServerlessOfflineSQS;
