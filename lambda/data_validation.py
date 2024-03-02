import boto3
import csv
import os

def handler(event, context):
    s3 = boto3.client('s3')

    # Get the S3 bucket and object key from the event
    bucket_name = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']

    # Get the CSV file content
    csv_file = s3.get_object(Bucket=bucket_name, Key=key)
    csv_content = csv_file['Body'].read().decode('utf-8').splitlines()

    # Parse the CSV data
    reader = csv.DictReader(csv_content)
    valid_records = []
    for row in reader:
        # Perform basic validation, e.g., check for required fields
        if all(field in row for field in ['Year', 'Semester', 'ComputerScience', 'Math', 'Statistics', 'MachineLearning', 'DomainExpertise', 'Communication', 'Visualization', 'TakenCPSC483', 'PlanCPSC483', 'MajorCS', 'FamiliarR', 'FamiliarPython']):
            valid_records.append(row)
        else:
            print(f"Invalid record: {row}")

    # Return success
    return {
        'status': 200,
        'sourceBucketName': bucket_name,
        'sourceKey': key,
        'processedKey': 'processed_' + key.split('/')[-1]
    }
