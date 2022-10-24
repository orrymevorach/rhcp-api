const axios = require('axios');
const cheerio = require('cheerio');

// This function returns an array of objects, each one containing the date and href of an individual concert.
// These are the most recent concerts, they appear on page 1 of the artists setlists

async function getConcertDatesAndHrefs(url) {
  const html = await axios.get(url);
  const $ = cheerio.load(html.data);
  const allConcertPageLinks = $(
    'a[title="View this Red Hot Chili Peppers setlist"]'
  );
  let formattedHrefs = [];
  await allConcertPageLinks.each(async (idx, el) => {
    const href = await `https://www.setlist.fm/${el.attribs.href}`.replace(
      '../setlist',
      'setlist'
    );
    formattedHrefs.push(href);
  });
  let pageOneSetLists = [];
  formattedHrefs.forEach((href, hrefIndex) => {
    let formattedDate = '';
    $('.dateBlock').each((dateNoteIndex, dateNode) => {
      if (dateNoteIndex === hrefIndex) {
        formattedDate = $(dateNode)
          .text()
          .trim()
          .replace(/[\r\n]/gm, '-');
      }
    });

    const setListData = {
      href,
      formattedDate,
      dateInJs: new Date(formattedDate),
    };
    pageOneSetLists.push(setListData);
  });
  return pageOneSetLists;
}

module.exports = getConcertDatesAndHrefs;
