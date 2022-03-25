const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const configModel = require("../utils/configModel");

const PaymentMethod = new mongoose.Schema(
  {
    name: {
      required: true,
      type: String,
    },
    school: {
      type: ObjectId,
      ref: "School",
    },
  },
  configModel.options
);

module.exports = mongoose.model("PaymentMethod", PaymentMethod);
