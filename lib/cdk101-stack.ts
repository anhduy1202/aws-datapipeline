import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { createS3Buckets } from "./s3-setup";
import { createLambda } from "./lambda-setup";
import { createStepFunction } from "./stepfunc-setup";
import { stepFunctionRole } from "./iam-setup";
import { createEventBridge } from "./eventbridge-setup";
import { createGlue, createGlueDatabase } from "./glue-setup";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class Cdk101Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 buckets
    const { rawDataBucket, processedDataBucket } = createS3Buckets(this);
    // Glue Database
    const { glueDatabase } = createGlueDatabase(this);
    // Glue crawler
    const { glueCrawler } = createGlue(this, rawDataBucket, glueDatabase);
    // Lambda Functions
    const { parseValidationData, startCrawlerLambda, sesNotificationLambda } =
      createLambda(this, glueCrawler);
    // State Machine
    const { dataProcessingStateMachine } = createStepFunction(
      this,
      [parseValidationData, startCrawlerLambda],
      glueCrawler,
    );
    // Event Bridge
    const { s3EventRule, glueCrawlerEventRule } = createEventBridge(
      this,
      dataProcessingStateMachine,
      rawDataBucket,
      glueCrawler,
      sesNotificationLambda,
    );
  }
}
