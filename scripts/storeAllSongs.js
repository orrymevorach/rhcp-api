const storeDate = require('./storeDate');
const getSongCountFromSetLists = require('./functions/getSongCountFromSetLists');
const getSongsFromSetListPage = require('./functions/getSongsFromSetListPage');
const getConcertDatesAndHrefs = require('./functions/getConcertData');
const AirtableConfig = require('./utils/airtable');
const dotenv = require('dotenv');
dotenv.config();

async function storeAllSongsInAirtable(allSongs) {
  console.log('Storing all songs in Airtable...');
  const formatSongsForAirtable = allSongs.map(song => {
    return {
      fields: song,
    };
  });

  //   Airtable only lets you add ten records at a time, so we chunk the songs array into arrays of 10 songs or less
  const chunkSize = 10;
  for (let i = 0; i < formatSongsForAirtable.length; i += chunkSize) {
    const chunk = formatSongsForAirtable.slice(i, i + chunkSize);
    await AirtableConfig.base('appeVwl7RXW9T18gk')('Song Count').create(
      chunk,
      (err, records) => {
        if (err) console.log('err', err);
        records.forEach(record => {
          console.log(`Created record for ${record.fields.song}`);
        });
      }
    );
  }
}

async function run() {
  console.log('Starting script...');
  const urls = [
    'https://www.setlist.fm/setlists/red-hot-chili-peppers-13d68969.html',
    'https://www.setlist.fm/setlists/red-hot-chili-peppers-13d68969.html?page=2',
    'https://www.setlist.fm/setlists/red-hot-chili-peppers-13d68969.html?page=3',
    'https://www.setlist.fm/setlists/red-hot-chili-peppers-13d68969.html?page=4',
    'https://www.setlist.fm/setlists/red-hot-chili-peppers-13d68969.html?page=5',
  ];

  const allLinks = [];
  for (url of urls) {
    const pageLinks = await getConcertDatesAndHrefs(url);
    allLinks.push(...pageLinks);
  }

  storeDate();
  const allSongs = await getSongsFromSetListPage(allLinks);
  const formattedSongs = await getSongCountFromSetLists(allSongs);
  await storeAllSongsInAirtable(formattedSongs);
}

module.exports = run;
// run();
