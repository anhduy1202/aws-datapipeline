import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { createS3Buckets } from "./s3-setup";
import { createLambda } from "./lambda-setup";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class Cdk101Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 buckets
    const { rawDataBucket, processedDataBucket } = createS3Buckets(this);
    // Lambda Functions
    const { parseValidationData } = createLambda(this);
    // S3 Trigger event
    rawDataBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(parseValidationData),
    );
    // example resource
    // const queue = new sqs.Queue(this, 'Cdk101Queue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
