import mongoose from "mongoose";
import configModel from "../utils/configModel";
const { ObjectId } = mongoose.Types;

const Subject = new mongoose.Schema(
  {
    name: {
      required: true,
      type: String,
    },
    school: {
      type: ObjectId,
      ref: "School",
      required: true,
    },
  },
  configModel.options
);

Subject.statics.validateById = async function (id) {
  let subject = await this.findById(id);
  if (!subject) {
    return false;
  }
  return true;
};

export default mongoose.model("Subject", Subject);
