const { schedule } = require('@netlify/functions');
const scrapeDataAndWriteToFile = require('../../scripts/app');

const handler = async function (event, context) {
  console.log('Starting netlify function');
  await scrapeDataAndWriteToFile();
  return {
    statusCode: 200,
  };
};

module.exports.handler = schedule('* * * * *', handler);
