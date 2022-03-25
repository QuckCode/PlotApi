const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const configModel = require("../utils/configModel");

const Sms = new mongoose.Schema(
  {
    message: {
      required: true,
      type: String,
    },
    from: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    sentBy: {
      type: String,
      required: true,
    },
    school: {
      type: ObjectId,
      ref: "School",
    },
  },
  configModel.options
);

module.exports = mongoose.model("Sms", Sms);
