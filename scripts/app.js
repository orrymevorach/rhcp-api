const axios = require('axios');
const cheerio = require('cheerio');
const {
  formatDataAndStoreInAirtable,
} = require('./formatDataAndStoreInAirtable');
const storeDate = require('./storeDate');

async function getPageLinks(url) {
  console.log(`Scraping data from ${url}`);
  const html = await axios.get(url);
  const $ = cheerio.load(html.data);

  const allConcertPageLinks = $(
    'a[title="View this Red Hot Chili Peppers setlist"]'
  );
  const formattedHrefs = [];
  await allConcertPageLinks.each(async (idx, el) => {
    const href = await `https://www.setlist.fm/${el.attribs.href}`.replace(
      '../setlist',
      'setlist'
    );
    formattedHrefs.push(href);
  });
  console.log('Success!');
  return formattedHrefs;
}

async function getAllSongsFromSetLists(concertPageLinks) {
  console.log('Getting songs from page links and pushing to list...');
  const allSongs = [];
  for (link of concertPageLinks) {
    const { data } = await axios.get(link);
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

async function run() {
  console.log('Starting script...');
  const urls = [
    'https://www.setlist.fm/setlists/red-hot-chili-peppers-13d68969.html',
    'https://www.setlist.fm/setlists/red-hot-chili-peppers-13d68969.html?page=2',
    'https://www.setlist.fm/setlists/red-hot-chili-peppers-13d68969.html?page=3',
    'https://www.setlist.fm/setlists/red-hot-chili-peppers-13d68969.html?page=4',
  ];

  const allLinks = [];
  for (url of urls) {
    const pageLinks = await getPageLinks(url);
    allLinks.push(...pageLinks);
  }

  const setLists = await getAllSongsFromSetLists(allLinks);
  storeDate();
  await formatDataAndStoreInAirtable(setLists);
}

// module.exports = run;
run();
