const sendServerError = (err, res) => {
  console.error(err.message);
  res.status(500).send('Server error');
};

module.exports = { sendServerError };
