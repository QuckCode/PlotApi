const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const configModel = require("../utils/configModel");

const Fee = new mongoose.Schema(
  {
    name: {
      required: true,
      type: String,
    },
    amount: {
      type: Number,
    },
    school: {
      type: ObjectId,
      ref: "School",
    },
  },
  configModel.options
);

module.exports = mongoose.model("Fee", Fee);
