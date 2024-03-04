# DataPipeline with AWS
## Description
- When user upload data, in this case, a CSV contains survey from CSUF student, it'll first validate the data columns with trigger from S3 Upload, then it'll start the Glue Crawler to feed into Glue Catalog and query using Athena if needed, all of these are orchestrated by Step Functions, when Crawler started/finished, SES will send email to notify 
## Tech Stack
- CDK
- S3
- Lambdas (both Node.js and Python)
- Event Bridge (Cloudwatch Event)
- Step Functions
- Glue Crawler + Athena
- SES
## Architecture Diagram
<img width="567" alt="Screenshot 2024-03-04 at 3 01 53 AM" src="https://github.com/anhduy1202/aws-datapipeline/assets/58461444/5b5bfff2-75a7-40d7-8551-3e95170d7deb">

## Screenshots 
### S3 Upload
<img width="925" alt="Screenshot 2024-03-04 at 3 12 13 AM" src="https://github.com/anhduy1202/aws-datapipeline/assets/58461444/89f78194-4ac3-4360-a3a5-0bd3b0b06129">

### Step Functions
<img width="1418" alt="Screenshot 2024-03-04 at 3 12 48 AM" src="https://github.com/anhduy1202/aws-datapipeline/assets/58461444/267330a1-f0de-45e1-af43-8c8e5d46246f">

### Glue Crawler
<img width="1428" alt="Screenshot 2024-03-04 at 3 13 27 AM" src="https://github.com/anhduy1202/aws-datapipeline/assets/58461444/22503108-c828-4afa-95f9-7d158fba9024">

### Athena (Query)
<img width="1341" alt="Screenshot 2024-03-04 at 3 14 01 AM" src="https://github.com/anhduy1202/aws-datapipeline/assets/58461444/ae088c5c-ad2c-43fd-aa17-b8f9d4abface">

### Completed Email (SES)
<img width="1090" alt="Screenshot 2024-03-04 at 3 14 41 AM" src="https://github.com/anhduy1202/aws-datapipeline/assets/58461444/70d38a27-3aed-4092-b0f2-47eee7116ca2">

## Demo
https://github.com/anhduy1202/aws-datapipeline/assets/58461444/4c0b7581-b6a9-4698-83d2-c706c564faf8


