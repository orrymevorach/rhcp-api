const fs = require('fs');

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
          count: 1,
          lastPlayed: dateInJs,
          formattedDate,
        };
      } else {
        songsWithCount[song] = {
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
      sortedSongs.push([song, songsWithCount[song]]);
    }
    return sortedSongs.sort((a, b) => {
      return b[1].count - a[1].count;
    });
  }

  const sorted = sortByMostPlayed();

  fs.writeFile(
    __dirname + '/json/songCount.json',
    JSON.stringify(sorted, null, 2),
    err => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Successfully written data to /json/songCount.json');
    }
  );
}

module.exports = generateSongCount;
