const formatDate = date => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const formatTime = date => {
  const AMPM = date.getHours > 12 ? 'AM' : 'PM';
  return `${date.getHours()}:${date.getMinutes()}${AMPM}`;
};

module.exports = {
  formatDate,
  formatTime,
};
