const dotenv = require('dotenv');
const storeDate = require('./storeDate');
const AirtableConfig = require('./utils/airtable');
const { formatDate } = require('./utils/utils');
dotenv.config();

async function formatDataAndStoreInAirtable(setLists) {
  console.log('Starting to format song count data...');
  function getSongsArray() {
    const allSongs = [];
    setLists.forEach(([song, date]) => {
      allSongs.push({ song, date });
    });
    return allSongs;
  }

  function count() {
    const allSongs = getSongsArray();
    const songsWithCount = {};
    allSongs.forEach(({ song, date }) => {
      const dateInJs = new Date(date);
      const formattedDate = formatDate(dateInJs);
      if (!songsWithCount[song]) {
        songsWithCount[song] = {
          song,
          count: 1,
          lastPlayed: dateInJs,
          formattedDate,
        };
      } else {
        songsWithCount[song] = {
          song,
          count: songsWithCount[song].count + 1,
          lastPlayed:
            dateInJs > songsWithCount[song].lastPlayed
              ? dateInJs
              : songsWithCount[song].lastPlayed,
          formattedDate:
            dateInJs > songsWithCount[song].lastPlayed
              ? formattedDate
              : songsWithCount[song].formattedDate,
        };
      }
    });
    return songsWithCount;
  }

  function sortByMostPlayed() {
    const songsWithCount = count();
    const sortedSongs = [];
    for (const song in songsWithCount) {
      sortedSongs.push(songsWithCount[song]);
    }
    return sortedSongs
      .sort((a, b) => {
        return b.count - a.count;
      })
      .map(({ song, count, formattedDate }) => {
        return {
          song,
          count,
          formattedDate,
        };
      });
  }

  const sorted = sortByMostPlayed();
  console.log('Success!');
  console.log('Storing data in Airtable...');

  await AirtableConfig.base('appeVwl7RXW9T18gk')('Song Count')
    .select()
    .eachPage(async function page(records) {
      records.forEach(function (record) {
        const songName = record.get('song');
        sorted.find(songData => {
          if (songName === songData.song) {
            record.replaceFields(songData, function (err, record) {
              if (err) {
                console.log('Error:', err);
                return;
              }
              console.log(`Success updating record for ${record.get('song')}`);
            });
          }
        });
      });
    });
  return;
}

module.exports = { formatDataAndStoreInAirtable, formatDate };
