import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";
import { lambdaRole } from "./iam-setup";

export const createLambda = (scope: Construct) => {
  // IAM Role
  const { lambdaExecutionRole } = lambdaRole(scope);
  // Data validation lambda
  const parseValidationData = new lambda.Function(
    scope,
    "ParseValidateCsvFunction",
    {
      runtime: lambda.Runtime.PYTHON_3_9,
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
  return { parseValidationData };
};
