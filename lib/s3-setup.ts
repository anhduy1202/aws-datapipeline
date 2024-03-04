import * as cloudtrail from "aws-cdk-lib/aws-cloudtrail";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";

export const createS3Buckets = (scope: Construct) => {
  // Raw data bucket
  const rawDataBucket = new s3.Bucket(scope, "MyFirstBucket", {
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    autoDeleteObjects: true,
    versioned: true,
    objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  });

  // Processed file bucket
  const processedDataBucket = new s3.Bucket(scope, "ProcessedDataBucket", {
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    autoDeleteObjects: true,
    versioned: true,
    objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  });
  createCloudTrail(scope, rawDataBucket);
  return { rawDataBucket, processedDataBucket };
};

const createCloudTrail = (
  scope: Construct,
  rawDataBucket: cdk.aws_s3.Bucket,
) => {
  // Create a CloudTrail trail
  const trail = new cloudtrail.Trail(scope, "CDK101Trail", {
    sendToCloudWatchLogs: true,
  });

  trail.addS3EventSelector(
    [
      {
        bucket: rawDataBucket,
      },
    ],
    {
      readWriteType: cloudtrail.ReadWriteType.ALL,
    },
  );
};
