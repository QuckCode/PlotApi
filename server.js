require("@babel/register");
require("module-alias/register");
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const config = require("@config");
const listEndpoints = require("express-list-endpoints");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const port = process.env.PORT || 4000;
const cors = require("cors");
const { notFoundMiddleWare } = require("@middleware/notFound");
const { errorMiddleWare } = require("@middleware/Error");

const app = express();

app.use(cors());

mongoose.connect(config.db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;

/**
 * Expose
 */

module.exports = {
  app,
  connection,
};

// Bootstrap routes
require("@app/Home");
require("@config/passport/local", passport);
require("@config/express")(app, passport);
require("@app/School");
require("@app/Students");
require("@app/Staff");
require("@app/Section");
require("@app/Class");
require("@app/Department");
require("@app/Subject");
require("@app/Designation");
require("@app/Arm");
require("@app/Behaviour");
require("@app/Tests");
require("@app/Skills");
require("@app/Sms");
require("@app/Result");
require("@app/ScratchCard");

// redis.on("connect", () => {
//   console.log("connected to Redis");
// });

var __setOptions = mongoose.Query.prototype.setOptions;

mongoose.Query.prototype.setOptions = function () {
  __setOptions.apply(this, arguments);
  if (this.options.lean == null) this.options.lean = true;
  return this;
};

connection
  .on("error", console.error.bind(console, "connection error:"))
  .once("open", () => {
    if (app.get("env") === "test") return;
    app.listen(port);
    console.log("Express app started on port " + port);
  });

console.log(listEndpoints(app));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(notFoundMiddleWare);
app.use(errorMiddleWare);
