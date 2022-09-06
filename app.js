const axios = require('axios');
const cheerio = require('cheerio');
const generateSongCount = require('./generateSongCount.js');

async function scrapeData(url) {
  console.log(`Starting data scrape from ${url}`);
  try {
    const html = await axios.get(url);
    const $ = cheerio.load(html.data);

    const allConcertPageLinks = $(
      'a[title="View this Red Hot Chili Peppers setlist"]'
    );

    const allSetLists = [];
    await allConcertPageLinks.each(async (idx, el) => {
      const href = await `https://www.setlist.fm/${el.attribs.href}`.replace(
        '../setlist',
        'setlist'
      );
      const { data: setListData } = await axios.get(href);
      const $2 = cheerio.load(setListData);
      const isPartOfTour = $2(
        'a[href="../../../search?artist=13d68969&query=tour:%282022-23+Global+Stadium+Tour%29"]'
      ).length;

      if (isPartOfTour) {
        const songs = $2('.songLabel');
        const setlist = [];
        songs.each((idx, el) => {
          const song = el.children[0].data;
          const date = `${$2('.month').text()} ${$2('.day').text()}, ${$2(
            '.year'
          ).text()}`;
          setlist.push([song, date]);
        });
        await allSetLists.push(setlist);
      }
      return;
    });

    return allSetLists;
  } catch (err) {
    console.error(err);
  }
}

async function scrapeDataAndWriteToFile() {
  const urlPageOne =
    'https://www.setlist.fm/setlists/red-hot-chili-peppers-13d68969.html';
  const urlPageTwo =
    'https://www.setlist.fm/setlists/red-hot-chili-peppers-13d68969.html?page=2';
  const urlPageThree =
    'https://www.setlist.fm/setlists/red-hot-chili-peppers-13d68969.html?page=3';
  const urlPageFour =
    'https://www.setlist.fm/setlists/red-hot-chili-peppers-13d68969.html?page=4';
  const urlPageFive =
    'https://www.setlist.fm/setlists/red-hot-chili-peppers-13d68969.html?page=5';

  const pageOneData = await scrapeData(urlPageOne);
  const pageTwoData = await scrapeData(urlPageTwo);
  const pageThreeData = await scrapeData(urlPageThree);
  const pageFourData = await scrapeData(urlPageFour);
  // const pageFiveData = await scrapeData(urlPageFive);

  setTimeout(async () => {
    const setLists = await [
      ...pageOneData,
      ...pageTwoData,
      ...pageThreeData,
      ...pageFourData,
      // ...pageFiveData,
    ];
    await generateSongCount(setLists);
  }, 5000);
}

scrapeDataAndWriteToFile();

// module.exports = scrapeDataAndWriteToFile;
