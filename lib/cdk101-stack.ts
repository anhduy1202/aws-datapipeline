import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { createS3Buckets } from "./s3-setup";
import { createLambda } from "./lambda-setup";
import { createStepFunction } from "./stepfunc-setup";
import { stepFunctionRole } from "./iam-setup";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import { createEventBridge } from "./eventbridge-setup";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class Cdk101Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 buckets
    const { rawDataBucket, processedDataBucket } = createS3Buckets(this);
    // Lambda Functions
    const { parseValidationData, processData } = createLambda(this);
    // State Machine
    const { dataProcessingStateMachine } = createStepFunction(this, [
      parseValidationData,
      processData,
    ]);
    // Event Bridge
    const { s3EventRule } = createEventBridge(
      this,
      dataProcessingStateMachine,
      rawDataBucket,
    );
  }
}
