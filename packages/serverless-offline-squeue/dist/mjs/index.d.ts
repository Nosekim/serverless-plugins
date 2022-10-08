export default ServerlessOfflineSQS;
declare class ServerlessOfflineSQS {
    constructor(serverless: any, cliOptions: any);
    cliOptions: any;
    options: any;
    sqs: SQS | null;
    lambda: any;
    serverless: any;
    hooks: {
        "offline:start:init": () => Promise<void>;
        "offline:start:ready": () => Promise<void>;
        "offline:start": () => Promise<void>;
        "offline:start:end": (skipExit: any) => Promise<void>;
    };
    start(): Promise<void>;
    ready(): Promise<void>;
    _listenForTermination(): Promise<void>;
    _startWithExplicitEnd(): Promise<void>;
    end(skipExit: any): Promise<void>;
    _createLambda(lambdas: any): void;
    _createSqs(events: any, skipStart: any): Promise<void>;
    _mergeOptions(): void;
    _getEvents(): {
        sqsEvents: any[];
        lambdas: any[];
    };
    _resolveFn(obj: any): any;
    _getResources(): any;
}
import SQS from "./sqs";
