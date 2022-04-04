import mongoose from "mongoose";
import configModel from "../utils/configModel";
const { ObjectId } = mongoose.Types;

const Class = new mongoose.Schema(
  {
    name: {
      required: true,
      type: String,
    },
    section: {
      type: ObjectId,
      ref: "Sections",
      required: true,
    },
    school: {
      type: ObjectId,
      ref: "School",
      required: true,
    },
    subjects: {
      type: [
        {
          type: ObjectId,
          ref: "Subject",
          unique: true,
        },
      ],
      default: [],
    },
    tests: {
      type: [
        {
          type: ObjectId,
          ref: "Test",
          unique: true,
        },
      ],
      default: [],
    },
    hasSubjectGroup: {
      type: Boolean,
      default: false,
    },
  },
  configModel.options
);

Class.statics.validateById = async function (id) {
  let classN = await this.findById(id);
  if (!classN) {
    return false;
  }
  return true;
};

export default mongoose.model("Class", Class);
