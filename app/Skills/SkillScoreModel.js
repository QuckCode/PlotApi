import mongoose from "mongoose";
import configModel from "../utils/configModel";
const { ObjectId } = mongoose.Types;

const SkillScore = new mongoose.Schema(
  {
    score: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4, 5],
    },
    skill: {
      type: ObjectId,
      ref: "Skill",
      required: true,
    },
    class: {
      type: ObjectId,
      ref: "Class",
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
export default mongoose.model("SkillScore", SkillScore);
