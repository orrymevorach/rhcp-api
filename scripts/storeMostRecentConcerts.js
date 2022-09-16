const AirtableConfig = require('./utils/airtable');
const getConcertDatesAndHrefs = require('./functions/getConcertData');
const getMostRecentConcertDate = require('./functions/getMostRecentConcertDate');
const getSongCountFromSetLists = require('./functions/getSongCountFromSetLists');
const getSongsFromSetListPage = require('./functions/getSongsFromSetListPage');
const storeDate = require('./storeDate');

const pageOneConcerts =
  'https://www.setlist.fm/setlists/red-hot-chili-peppers-13d68969.html';

async function updateSongCountFromSelectedPage() {
  return await AirtableConfig.base('appeVwl7RXW9T18gk')('Song Count')
    .select()
    .eachPage(async records => {
      let allDates = [];
      for (record of records) {
        allDates.push(new Date(record.fields.dateInJs));
      }
      const mostRecentConcert = await getMostRecentConcertDate(allDates);
      const concertData = await getConcertDatesAndHrefs(pageOneConcerts);
      const filteredConcerts = concertData.filter(({ dateInJs }) => {
        if (dateInJs > mostRecentConcert) return true;
      });
      const allSongs = await getSongsFromSetListPage(filteredConcerts);
      const formattedSongs = await getSongCountFromSetLists(allSongs);

      if (formattedSongs.length === 0) {
        console.log('There are no records to update!');
        return;
      }

      console.log('Storing data in Airtable...');
      await AirtableConfig.base('appeVwl7RXW9T18gk')('Song Count')
        .select()
        .eachPage(async function page(records) {
          records.forEach(function (record) {
            const songName = record.get('song');
            const count = record.get('count');
            formattedSongs.find(songData => {
              if (songName === songData.song) {
                const updatedSongData = {
                  song: songName,
                  count: count + 1,
                  formattedDate: songData.formattedDate,
                  dateInJs: songData.dateInJs,
                };
                record.replaceFields(updatedSongData, function (err, record) {
                  if (err) {
                    console.log('Error:', err);
                    return;
                  }
                  console.log(
                    `Success updating record for ${record.get('song')}`
                  );
                });
              }
            });
          });
        });
    });
}

async function run() {
  console.log('Starting script...');
  storeDate();
  await updateSongCountFromSelectedPage();
}

module.exports = run;
