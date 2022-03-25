const notFoundMiddleWare = (req, res) => {
  res.status(404).json({
    title: "Not found",
    message: "This route was not found",
  });
};

module.exports = { notFoundMiddleWare };
