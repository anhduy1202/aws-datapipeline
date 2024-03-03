import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export const lambdaRole = (scope: Construct) => {
  const lambdaExecutionRole = new iam.Role(scope, "LambdaExecutionRole", {
    assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    description:
      "An IAM role for Lambda execution with permissions to access S3",
  });
  // Permission to access S3
  lambdaExecutionRole.addToPolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["s3:GetObject", "s3:putObject"],
      resources: [
        "arn:aws:s3:::cdk101stack-myfirstbucketb8884501-buaggk370hah/*",
        "arn:aws:s3:::cdk101stack-processeddatabucket4e25d3b7-rwliej0g7s4j/*",
      ],
    }),
  );
  // Permissions to write to CloudWatch Logs
  lambdaExecutionRole.addToPolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
      ],
      resources: ["arn:aws:logs:*:*:*"],
    }),
  );
  // Permission to trigger step function
  lambdaExecutionRole.addToPolicy(
    new iam.PolicyStatement({
      actions: ["states:StartExecution"],
      resources: [
        "arn:aws:iam::223108796204:role/Cdk101Stack-DataProcessingStateMachineRoleCF15CC21-aCfKCiWaeDz4",
      ],
    }),
  );
  return { lambdaExecutionRole };
};

export const stepFunctionRole = (
  scope: Construct,
  stateMachine: cdk.aws_stepfunctions.StateMachine,
  lambdas: cdk.aws_lambda.Function[],
) => {
  // Assuming 'dataProcessingStateMachine' is your Step Functions state machine
  const stateMachineExecutionRole = stateMachine.role as iam.IRole;

  // Granting the state machine execution role permission to invoke Lambda functions
  stateMachineExecutionRole.addToPrincipalPolicy(
    new iam.PolicyStatement({
      actions: ["lambda:InvokeFunction"],
      resources: [lambdas[0].functionArn, lambdas[1].functionArn],
    }),
  );
  return { stateMachineExecutionRole };
};

export const createEventBridgeRole = (
  scope: Construct,
  stateMachine: cdk.aws_stepfunctions.StateMachine,
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
  return { eventBridgeRole };
};
