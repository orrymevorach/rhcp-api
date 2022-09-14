const axios = require('axios');
const cheerio = require('cheerio');
const formatDataAndStoreInAirtable = require('./formatDataAndStoreInAirtable');

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
  console.log(`Success! Scraped data from ${url}`);
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
  console.log('Success! All songs pushed to list.');
  return allSongs;
}

async function run() {
  console.log('Starting script...');
  const urlPageOne =
    'https://www.setlist.fm/setlists/red-hot-chili-peppers-13d68969.html';
  const urlPageTwo =
    'https://www.setlist.fm/setlists/red-hot-chili-peppers-13d68969.html?page=2';
  const urlPageThree =
    'https://www.setlist.fm/setlists/red-hot-chili-peppers-13d68969.html?page=3';
  const urlPageFour =
    'https://www.setlist.fm/setlists/red-hot-chili-peppers-13d68969.html?page=4';
  const pageLinks = await getPageLinks(urlPageOne);
  const pageLinksPageTwo = await getPageLinks(urlPageTwo);
  const pageLinksPageThree = await getPageLinks(urlPageThree);
  const pageLinksPageFour = await getPageLinks(urlPageFour);

  const allLinks = [
    ...pageLinks,
    ...pageLinksPageTwo,
    ...pageLinksPageThree,
    ...pageLinksPageFour,
  ];
  const setLists = await getAllSongsFromSetLists(allLinks);
  await formatDataAndStoreInAirtable(setLists);
}

module.exports = run;
