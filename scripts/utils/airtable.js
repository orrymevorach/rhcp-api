const Airtable = require('airtable');
const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.AIRTABLE_API_KEY;
Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey,
});
const AirtableConfig = new Airtable({ apiKey });
module.exports = AirtableConfig;
