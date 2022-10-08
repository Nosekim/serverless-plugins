export default SQS;
declare class SQS {
    constructor(lambda: any, resources: any, options: any);
    lambda: any;
    resources: any;
    options: any;
    client: SQSClient;
    queue: PQueue<import("p-queue/dist/priority-queue").default, import("p-queue").DefaultAddOptions>;
    create(events: any): Promise<any[]>;
    start(): void;
    stop(timeout: any): void;
    _create(functionKey: any, rawSqsEventDefinition: any): Promise<void>;
    _rewriteQueueUrl(queueUrl: any): any;
    _getQueueUrl(queueName: any): any;
    _sqsEvent(functionKey: any, sqsEvent: any): Promise<void>;
    _getResourceProperties(queueName: any): any;
    _createQueue({ queueName }: {
        queueName: any;
    }, remainingTry?: number): any;
}
import SQSClient from "aws-sdk/clients/sqs";
import { default as PQueue } from "p-queue";
