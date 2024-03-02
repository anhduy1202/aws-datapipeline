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

  // Data Processing Lambda Layer
  const pandasLayer = new lambda.LayerVersion(scope, "PandasLayer", {
    code: lambda.Code.fromAsset("./pandas_layer/pandas_layer.zip"), // Adjust the path to where your ZIP file is located
    compatibleRuntimes: [lambda.Runtime.PYTHON_3_9], // Specify compatible runtimes
    description: "A layer for pandas",
  });

  // Data Processing Lambda Function
  const processData = new lambda.Function(scope, "ProcessCsvFunction", {
    runtime: lambda.Runtime.PYTHON_3_9,
    handler: "data_transformation.handler",
    code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
    layers: [pandasLayer],
    role: lambdaExecutionRole,
  });

  return { parseValidationData, processData };
};
