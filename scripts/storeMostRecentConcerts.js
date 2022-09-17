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
          const songsArray = [];
          records.forEach(function (record) {
            const songName = record.get('song');
            const count = record.get('count');
            songsArray.push(songName);
            formattedSongs.find(songData => {
              if (songName === songData.song) {
                const updatedSongData = {
                  count: count + 1,
                  formattedDate: songData.formattedDate,
                  dateInJs: songData.dateInJs,
                };
                record.updateFields(updatedSongData, function (err, record) {
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
          // Check for new songs, and add them to song list
          console.log('Checking for new songs...');
          formattedSongs.forEach(song => {
            if (!songsArray.includes(song.song)) {
              AirtableConfig.base('appeVwl7RXW9T18gk')('Song Count').create(
                song,
                (err, record) => {
                  if (err) console.log('err', err);
                  console.log(`Created record for ${record.fields.song}`);
                }
              );
            }
          });
          console.log('Done!');
        });
    });
}

async function run() {
  console.log('Starting script...');
  storeDate();
  await updateSongCountFromSelectedPage();
}

module.exports = run;
