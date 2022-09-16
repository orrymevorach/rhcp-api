const axios = require('axios');
const cheerio = require('cheerio');

async function getSongsFromSetListPage(concertPageLinks) {
  console.log('Getting songs from each set list...');
  const allSongs = [];
  for (link of concertPageLinks) {
    const { data } = await axios.get(link.href);
    const $2 = cheerio.load(data);
    const songs = $2('.songLabel');
    const isPartOfTour = $2(
      'a[href="../../../search?artist=13d68969&query=tour:%282022-23+Global+Stadium+Tour%29"]'
    ).length;
    if (isPartOfTour) {
      songs.each((idx, el) => {
        const song = el.children[0].data;
        const date = `${$2('.month').text()} ${$2('.day').text()}, ${$2(
          '.year'
        ).text()}`;
        allSongs.push([song, date]);
      });
    }
  }
  console.log('Success!');
  return allSongs;
}

module.exports = getSongsFromSetListPage;
