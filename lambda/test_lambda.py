import json
from data_validation import handler  # Replace with your actual import

# Load the mock event
with open('mock_event.json', 'r') as file:
    mock_event = json.load(file)

# Set up mock environment variables if needed
import os
os.environ['MY_ENV_VAR'] = 'some_value'

# Call the Lambda handler
response = handler(mock_event, {})
print('Lambda response:', response)
