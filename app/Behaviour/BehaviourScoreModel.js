import mongoose from "mongoose";
import configModel from "../utils/configModel";
const { ObjectId } = mongoose.Types;

const BehaviourScore = new mongoose.Schema(
  {
    score: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4, 5],
    },
    behaviour: {
      type: ObjectId,
      ref: "Behaviour",
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

export default mongoose.model("BehaviourScore", BehaviourScore);
