async function getMostRecentConcertDate(songData) {
  const firstDateOfTour = new Date('2022-06-04');
  return songData.reduce((acc, curr) => {
    if (curr > acc) return curr;
    return acc;
  }, firstDateOfTour);
}

module.exports = getMostRecentConcertDate;
