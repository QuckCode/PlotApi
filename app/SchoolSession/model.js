const mongoose = require("mongoose");
const configModel = require("../utils/configModel");

const Session = new mongoose.Schema(
  {
    name: {
      required: true,
      type: String,
    },
    isCurrentSession: {
      type: Boolean,
      required: true,
    },
  },
  configModel.options
);

module.exports = mongoose.model("Session", Session);
