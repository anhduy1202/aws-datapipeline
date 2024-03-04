import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export const lambdaRole = (
  scope: Construct,
  crawler: cdk.aws_glue.CfnCrawler,
) => {
  const crawlerArn = `arn:aws:glue:${cdk.Stack.of(scope).region}:${cdk.Stack.of(scope).account}:crawler/${crawler.ref}`;
  const lambdaExecutionRole = new iam.Role(scope, "LambdaExecutionRole", {
    assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    description:
      "An IAM role for Lambda execution with permissions to access resrouces",
  });
  lambdaExecutionRole.addToPolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        // Permission to access S3
        "s3:GetObject",
        "s3:putObject",
        // Permissions to write to CloudWatch Logs
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        // Permission to trigger step function
        "states:StartExecution",
        // Permission to start crawler
        "glue:StartCrawler",
        // SES
        "ses:SendEmail",
        "ses:SendRawEmail",
        "ses:ListIdentities",
      ],
      resources: [
        "arn:aws:s3:::cdk101stack-myfirstbucketb8884501-buaggk370hah/*",
        "arn:aws:s3:::cdk101stack-processeddatabucket4e25d3b7-rwliej0g7s4j/*",
        "arn:aws:logs:*:*:*",
        "arn:aws:iam::223108796204:role/Cdk101Stack-DataProcessingStateMachineRoleCF15CC21-aCfKCiWaeDz4",
        crawlerArn,
        "*",
      ],
    }),
  );
  return { lambdaExecutionRole };
};

export const createGlueRole = (scope: Construct) => {
  // Access to S3
  const glueRole = new iam.Role(scope, "GlueJobRole", {
    assumedBy: new iam.ServicePrincipal("glue.amazonaws.com"),
    managedPolicies: [
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSGlueServiceRole",
      ),
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess"),
    ],
  });
  return { glueRole };
};

export const stepFunctionRole = (
  scope: Construct,
  stateMachine: cdk.aws_stepfunctions.StateMachine,
  lambdas: cdk.aws_lambda.Function[],
  crawler: cdk.aws_glue.CfnCrawler,
) => {
  // Assuming 'dataProcessingStateMachine' is your Step Functions state machine
  const stateMachineExecutionRole = stateMachine.role as iam.IRole;

  // Granting the state machine execution role permission to invoke Lambda functions
  stateMachineExecutionRole.addToPrincipalPolicy(
    new iam.PolicyStatement({
      actions: ["lambda:InvokeFunction"],
      resources: [lambdas[0].functionArn],
    }),
  );
  // Granting permission to start crawler
  const crawlerArn = `arn:aws:glue:${cdk.Stack.of(scope).region}:${cdk.Stack.of(scope).account}:crawler/${crawler.ref}`;
  stateMachineExecutionRole.addToPrincipalPolicy(
    new iam.PolicyStatement({
      actions: ["glue:StartCrawler"],
      resources: [crawlerArn],
    }),
  );

  return { stateMachineExecutionRole };
};

export const createEventBridgeRole = (
  scope: Construct,
  stateMachine: cdk.aws_stepfunctions.StateMachine,
  sesNotificationLambda: cdk.aws_lambda.Function,
  glueCrawlerEventRule: cdk.aws_events.Rule,
) => {
  // Role for event bridge
  const eventBridgeRole = new iam.Role(scope, "EventBridgeRole", {
    assumedBy: new iam.ServicePrincipal("events.amazonaws.com"),
    description: "Role for EventBridge to trigger Step Functions",
  });
  eventBridgeRole.addToPolicy(
    new iam.PolicyStatement({
      actions: ["states:StartExecution"],
      resources: [stateMachine.stateMachineArn],
    }),
  );
  // Rule for SES
  sesNotificationLambda.addPermission("EventBridgeInvokePermission", {
    principal: new iam.ServicePrincipal("events.amazonaws.com"),
    sourceArn: glueCrawlerEventRule.ruleArn,
  });

  return { eventBridgeRole };
};
