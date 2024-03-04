import * as glue from "aws-cdk-lib/aws-glue";
import { Construct } from "constructs";
import { createGlueRole } from "./iam-setup";
import * as cdk from "aws-cdk-lib";
import * as logs from "aws-cdk-lib/aws-logs";

export const createGlueDatabase = (scope: Construct) => {
  const glueDatabase = new glue.CfnDatabase(scope, "SurveyDatabase", {
    catalogId: "223108796204",
    databaseInput: {
      description: "Database for student survey",
      name: "student-survey",
    },
  });
  return { glueDatabase };
};

export const createGlue = (
  scope: Construct,
  bucket: cdk.aws_s3.Bucket,
  db: cdk.aws_glue.CfnDatabase,
) => {
  // IAM Role
  const { glueRole } = createGlueRole(scope);
  // Create a CloudWatch log group for the crawler
  const crawlerLogGroup = new logs.LogGroup(scope, "GlueCrawlerLogs", {
    removalPolicy: cdk.RemovalPolicy.DESTROY,
  });

  // Glue Crawler
  const glueCrawler = new glue.CfnCrawler(scope, "RawDataCrawler", {
    role: glueRole.roleArn,
    databaseName: db.ref,
    targets: {
      s3Targets: [{ path: `s3://${bucket.bucketName}` }],
    },
  });
  return { glueCrawler };
};
