const { schedule } = require('@netlify/functions');
const run = require('../../scripts/storeAllSongs');

const handler = async function () {
  await run();
  return {
    statusCode: 200,
  };
};

module.exports.handler = schedule('* * * * *', handler);
