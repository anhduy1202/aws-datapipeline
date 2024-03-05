const { GlueClient, StartCrawlerCommand } = require("@aws-sdk/client-glue");

exports.handler = async (event) => {
  const client = new GlueClient({});
  const crawlerName = process.env.CRAWLER_NAME; // Use the crawler name from environment variables

  if (!crawlerName) {
    throw new Error("Missing environment variable: CRAWLER_NAME");
  }

  const params = {
    Name: crawlerName,
  };

  try {
    const command = new StartCrawlerCommand(params);
    const response = await client.send(command);
    console.log("Successfully started Glue crawler:", response);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Glue crawler started successfully" }),
    };
  } catch (error) {
    console.error("Error starting crawler:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Error starting Glue crawler: ${error.message}`,
      }),
    };
  }
};
