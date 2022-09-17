const formatDate = date => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const formatTime = date => {
  let hours = date.getHours() - 4;
  hours = hours > 12 ? hours - 12 : hours;
  let minutes =
    date.getMinutes().length === 1
      ? `0${date.getMinutes()}`
      : date.getMinutes();
  if (minutes === 0) minutes = '00';
  const AMPM = hours >= 12 ? 'PM' : 'AM';
  return `${hours}:${minutes}${AMPM}`;
};

module.exports = {
  formatDate,
  formatTime,
};
