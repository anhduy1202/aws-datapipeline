import * as cdk from "aws-cdk-lib";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import { Construct } from "constructs";
import { createEventBridgeRole } from "./iam-setup";

export const createEventBridge = (
  scope: Construct,
  stateMachine: cdk.aws_stepfunctions.StateMachine,
  rawDatabucket: cdk.aws_s3.Bucket,
  crawler: cdk.aws_glue.CfnCrawler,
  sesNotificationLambda: cdk.aws_lambda.Function,
) => {
  const s3EventRule = new events.Rule(scope, "S3TriggerEventRule", {
    eventPattern: {
      source: ["aws.s3"],
      detailType: ["AWS API Call via CloudTrail"],
      detail: {
        eventName: ["PutObject", "CompleteMultipartUpload"],
        requestParameters: {
          bucketName: [rawDatabucket.bucketName],
        },
      },
    },
  });
  s3EventRule.addTarget(
    new targets.SfnStateMachine(stateMachine, {
      input: events.RuleTargetInput.fromObject({
        bucketName: events.EventField.fromPath(
          "$.detail.requestParameters.bucketName",
        ),
        objectKey: events.EventField.fromPath("$.detail.requestParameters.key"),
      }),
    }),
  );
  const glueCrawlerEventRule = new events.Rule(scope, "GlueCrawlerEventRule", {
    eventPattern: {
      source: ["aws.glue"],
      detailType: ["Glue Crawler State Change"],
      detail: {
        crawlerName: [crawler.ref],
      },
    },
  });
  glueCrawlerEventRule.addTarget(
    new targets.LambdaFunction(sesNotificationLambda),
  );
  createEventBridgeRole(
    scope,
    stateMachine,
    sesNotificationLambda,
    glueCrawlerEventRule,
  );
  return { s3EventRule, glueCrawlerEventRule };
};
