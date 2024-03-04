import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";
import * as cdk from "aws-cdk-lib";
import { lambdaRole } from "./iam-setup";

export const createLambda = (
  scope: Construct,
  crawler: cdk.aws_glue.CfnCrawler,
) => {
  // IAM Role
  const { lambdaExecutionRole } = lambdaRole(scope, crawler);
  // Data validation lambda
  const parseValidationData = new lambda.Function(
    scope,
    "ParseValidateCsvFunction",
    {
      runtime: lambda.Runtime.PYTHON_3_10,
      handler: "data_validation.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
      role: lambdaExecutionRole,
    },
  );
  parseValidationData.addPermission("AllowS3Invocation", {
    action: "lambda:InvokeFunction",
    principal: new iam.ServicePrincipal("s3.amazonaws.com"),
    sourceArn: "arn:aws:s3:::cdk101stack-myfirstbucketb8884501-buaggk370hah", // ARN of the S3 bucket
  });

  // Crawler Lambda
  const startCrawlerLambda = new lambda.Function(scope, "StartCrawlerLambda", {
    runtime: lambda.Runtime.NODEJS_LATEST,
    handler: "startCrawler.handler",
    code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
    timeout: cdk.Duration.seconds(120),
    environment: {
      CRAWLER_NAME: crawler.ref,
    },
    role: lambdaExecutionRole,
  });
  // SES Lambda
  const sesNotificationLambda = new lambda.Function(
    scope,
    "SESNotificationLambda",
    {
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: "sesNotification.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
      role: lambdaExecutionRole,
      environment: {
        SES_EMAIL_RECIPIENT: "aduy1122@gmail.com", // Specify the recipient email
        SES_EMAIL_SENDER: "aduy1122@gmail.com", // Specify the sender email
      },
    },
  );

  return { parseValidationData, startCrawlerLambda, sesNotificationLambda };
};
