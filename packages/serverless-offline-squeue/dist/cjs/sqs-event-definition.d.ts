export default SQSEventDefinition;
declare class SQSEventDefinition {
    constructor(rawSqsEventDefinition: any, region: any, accountId: any);
    enabled: boolean | undefined;
    arn: string;
    queueName: any;
}
