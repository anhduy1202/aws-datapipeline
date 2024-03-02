import pandas as pd
import boto3
import csv
import os

def handler(event, context):
    s3 = boto3.client('s3')

    # Get the S3 bucket and object key from the event
    source_bucket_name = event['sourceBucketName']
    source_key = event['sourceKey']

    # Download file from S3 to /tmp directory
    download_path = '/tmp/' + source_key.split('/')[-1]
    s3.download_file(source_bucket_name, source_key, download_path)

    # Read the data into a Pandas DataFrame
    df = pd.read_csv(download_path)
    year_semester_distribution = df.groupby(['Year', 'Semester']).size().reset_index(name='Responses').sort_values(by=['Year'], ascending=False)

    # Save the processed DataFrame to a CSV in /tmp directory
    processed_file_path = '/tmp/processed_' + source_key.split('/')[-1]
    year_semester_distribution.to_csv(processed_file_path, index=False)

    # Upload the processed CSV file to the 'processedData' S3 bucket
    processed_bucket_name = 'cdk101stack-processeddatabucket4e25d3b7-rwliej0g7s4j'
    s3.upload_file(processed_file_path, processed_bucket_name, 'processed_' + source_key.split('/')[-1])
    return {
        'statusCode': 200,
        'body': 'Processed CSV file uploaded successfully.'
    }
