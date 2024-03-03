import * as cdk from "aws-cdk-lib";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import { stepFunctionRole } from "./iam-setup";

export const createStepFunction = (
  scope: Construct,
  lambdas: cdk.aws_lambda.Function[],
) => {
  const validateDataTask = new tasks.LambdaInvoke(scope, "Validate Data", {
    lambdaFunction: lambdas[0],
  });

  const transformDataTask = new tasks.LambdaInvoke(scope, "Transform Data", {
    lambdaFunction: lambdas[1],
    inputPath: "$",
  });

  const definition = validateDataTask.next(transformDataTask);

  const dataProcessingStateMachine = new sfn.StateMachine(
    scope,
    "DataProcessingStateMachine",
    {
      definition,
    },
  );
  const { stateMachineExecutionRole } = stepFunctionRole(
    scope,
    dataProcessingStateMachine,
    lambdas,
  );
  return { dataProcessingStateMachine };
};
