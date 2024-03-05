const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

exports.handler = async (event) => {
  const ses = new SESClient({ region: "us-east-1" });
  const params = {
    Source: process.env.SES_EMAIL_SENDER, // The email address that is sending the email (must be verified in SES)
    Destination: {
      ToAddresses: [
        process.env.SES_EMAIL_RECIPIENT, // The email address of the recipient
      ],
    },
    Message: {
      Subject: {
        Data: "Glue Crawler Execution Status", // The subject line of the email
        Charset: "UTF-8",
      },
      Body: {
        Text: {
          Data: "The Glue Crawler has completed successfully.", // The body text of the email
          Charset: "UTF-8",
        },
        // Optionally, you can also include an HTML body in addition to or instead of the text body
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    const data = await ses.send(command);
    console.log("Email sent:", data.MessageId);
    return { message: "Email sent successfully", messageId: data.MessageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { message: "Error", error: error.message };
  }
};
