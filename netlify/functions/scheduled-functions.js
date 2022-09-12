const { schedule } = require('@netlify/functions');
const scrapeDataAndWriteToFile = require('../app');

const handler = async function (event, context) {
  scrapeDataAndWriteToFile();
  console.log('Received event:', event);

  return {
    statusCode: 200,
  };
};

module.exports.handler = schedule('* * * * *', handler);
