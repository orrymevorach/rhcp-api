const { schedule } = require('@netlify/functions');
const run = require('../../scripts/storeMostRecentConcerts');

const handler = async function (event, context) {
  await run();
  return {
    statusCode: 200,
  };
};

module.exports.handler = schedule('0 12 * * *', handler);
