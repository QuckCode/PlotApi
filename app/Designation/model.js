const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const configModel = require("../utils/configModel");

const Designation = new mongoose.Schema(
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

export default mongoose.model("Designation", Designation);
