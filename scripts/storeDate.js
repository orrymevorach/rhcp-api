const AirtableConfig = require('./utils/airtable');
const { formatDate, formatTime } = require('./utils/utils');
const dotenv = require('dotenv');
dotenv.config();

async function storeDate() {
  console.log('Storing date + time in Airtable...');
  await AirtableConfig.base('appptIOz9nCmZxE3Q')('Last Updated Date')
    .select()
    .eachPage(function page(records) {
      const dateRecord = records[0];
      const dateInJs = new Date();
      const formattedDate = formatDate(dateInJs);
      const formattedTime = formatTime(dateInJs);
      dateRecord.replaceFields(
        { Date: formattedDate, Time: formattedTime },
        function (err, record) {
          if (err) {
            console.log('Error:', err);
            return;
          }
          console.log(
            `Success! Updated on ${formattedDate} at ${formattedTime}`
          );
        }
      );
    });
}

module.exports = storeDate;
