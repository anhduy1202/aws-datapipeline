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
      actions: ["s3:GetObject"],
      resources: [
        "arn:aws:s3:::cdk101stack-myfirstbucketb8884501-buaggk370hah/*",
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
  return { lambdaExecutionRole };
};
