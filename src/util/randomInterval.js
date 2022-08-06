function randomInterval(duration) {
  return Math.ceil(Math.random() * (duration * 2));
}

module.exports = {
  randomInterval,
};
