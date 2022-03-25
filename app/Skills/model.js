import mongoose from "mongoose";
import configModel from "../utils/configModel";
const { ObjectId } = mongoose.Types;

const Skill = new mongoose.Schema(
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

export default mongoose.model("Skill", Skill);
