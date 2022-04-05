const { BaseError } = require("@errors/baseErrors");

export const errorMiddleWare = (err, req, res, next) => {
  if (err) {
    return res
      .status(err.httpCode)
      .send({ title: err.title, message: err.message });
  }
  return res.status(err.status).send({
    title: err.type,
    message: err.message,
  });
};
