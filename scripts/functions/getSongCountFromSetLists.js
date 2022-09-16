const dotenv = require('dotenv');
const { formatDate } = require('../utils/utils');
dotenv.config();

function transformEachSongToObject(songs) {
  const allSongs = [];
  songs.forEach(([song, date]) => {
    allSongs.push({ song, date });
  });
  return allSongs;
}

function calculateSongPlayTotal(allSongs) {
  const songsWithCount = {};
  allSongs.forEach(({ song, date }) => {
    const dateInJs = new Date(date);
    const formattedDate = formatDate(dateInJs);
    if (!songsWithCount[song]) {
      songsWithCount[song] = {
        song,
        count: 1,
        dateInJs,
        formattedDate,
      };
    } else {
      songsWithCount[song] = {
        song,
        count: songsWithCount[song].count + 1,
        dateInJs:
          dateInJs > songsWithCount[song].dateInJs
            ? dateInJs
            : songsWithCount[song].dateInJs,
        formattedDate:
          dateInJs > songsWithCount[song].dateInJs
            ? formattedDate
            : songsWithCount[song].formattedDate,
      };
    }
  });
  return songsWithCount;
}

function convertSongDataToList(songsWithCountData) {
  const sortedSongs = [];
  for (const song in songsWithCountData) {
    sortedSongs.push(songsWithCountData[song]);
  }
  return sortedSongs;
}

async function getSongCountFromSetLists(songs) {
  console.log('Counting and formatting all songs...');
  const allSongs = transformEachSongToObject(songs);
  const songsWithCountData = calculateSongPlayTotal(allSongs);
  const songList = convertSongDataToList(songsWithCountData);
  console.log('Success!');
  return songList;
}

module.exports = getSongCountFromSetLists;
