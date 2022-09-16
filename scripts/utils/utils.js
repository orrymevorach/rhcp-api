const formatDate = date => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const formatTime = date => {
  const hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
  const minutes =
    date.getMinutes().length === 1
      ? `0${date.getMinutes()}`
      : date.getMinutes();
  const AMPM = date.getHours() >= 12 ? 'PM' : 'AM';
  return `${hours}:${minutes}${AMPM}`;
};

module.exports = {
  formatDate,
  formatTime,
};
