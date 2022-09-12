const scrapeDataAndWriteToFile = require('../../scripts/app');

const handler = async function (event, context) {
  console.log('starting cron...');
  scrapeDataAndWriteToFile();
  console.log('Received event:', event);

  return {
    statusCode: 200,
  };
};

module.exports.handler = handler;
