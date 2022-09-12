// const fs = require('fs');
const Airtable = require('airtable');
const dotenv = require('dotenv');
dotenv.config();

function generateSongCount(setLists) {
  function getSongsArray() {
    const allSongs = [];
    setLists.forEach(setlist => {
      setlist.forEach(([song, date]) => {
        allSongs.push({ song, date });
      });
    });
    return allSongs;
  }

  const formatDate = date => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

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

  const apiKey = process.env.AIRTABLE_API_KEY;
  Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey,
  });
  const base = new Airtable({ apiKey }).base('appeVwl7RXW9T18gk');
  base('Song Count')
    .select()
    .eachPage(function page(records) {
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

  // fs.writeFile(
  //   __dirname + '/json/songCount.json',
  //   JSON.stringify(sorted, null, 2),
  //   err => {
  //     if (err) {
  //       console.error(err);
  //       return;
  //     }
  //     console.log('Successfully written data to /json/songCount.json');
  //   }
  // );
}

module.exports = generateSongCount;
