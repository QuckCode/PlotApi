import mongoose from "mongoose";
import configModel from "../utils/configModel";
const { ObjectId } = mongoose.Types;

const TestScore = new mongoose.Schema(
  {
    score: {
      type: Number,
      required: true,
    },
    test: {
      type: ObjectId,
      ref: "Test",
      required: true,
    },
    class: {
      type: ObjectId,
      ref: "Class",
      required: true,
    },
    subject: {
      type: ObjectId,
      ref: "Subject",
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

export default mongoose.model("TestScore", TestScore);
