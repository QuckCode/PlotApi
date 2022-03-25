import mongoose from "mongoose";
import configModel from "../utils/configModel";
const { ObjectId } = mongoose.Types;

const SubjectGroup = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    subjects: [{ ref: "Subject", type: ObjectId }],
    school: {
      type: ObjectId,
      ref: "School",
      required: true,
    },
  },
  configModel.options
);

SubjectGroup.statics.validateById = async function (id) {
  let subjectGroup = await this.findById(id);
  if (!subjectGroup) {
    return false;
  }
  return true;
};

export default mongoose.model("SubjectGroup", SubjectGroup);
