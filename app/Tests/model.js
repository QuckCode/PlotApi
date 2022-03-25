import mongoose from "mongoose";
import configModel from "../utils/configModel";
const { ObjectId } = mongoose.Types;

const Test = new mongoose.Schema(
  {
    name: {
      required: true,
      type: String,
    },
    marksObtainable: {
      type: Number,
      required: true,
    },
    parentageOfTotal: {
      type: Number,
      required: true,
    },
    school: {
      type: ObjectId,
      ref: "School",
      required: true,
    },
  },
  configModel.options
);

Test.statics.validateById = async function (id) {
  let test = await this.findById(id);
  if (!test) {
    return false;
  }
  return true;
};

export default mongoose.model("Test", Test);
