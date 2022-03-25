const controller = require("./controller");

const { app } = require("../../server");

app.get("/", controller.index);
