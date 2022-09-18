const { schedule } = require('@netlify/functions');
const storeDate = require('./updateTime');

const handler = async function (event, context) {
  await storeDate();
  return {
    statusCode: 200,
  };
};

module.exports.handler = schedule('0 12 * * *', handler);
