import mongoose from "mongoose";
import configModel from "../utils/configModel";
const { ObjectId } = mongoose.Types;

const ScratchCard = new mongoose.Schema(
  {
    serialNumber: {
      required: true,
      type: String,
      unique: true,
    },
    pin: {
      required: true,
      type: String,
      unique: true,
    },
    used: {
      type: Boolean,
      required: true,
      default: false,
    },
    generatedDataAndTime: {
      type: Date,
      default: Date.now(),
      require: true,
    },
    amount: {
      required: true,
      type: Number,
    },
    school: {
      type: ObjectId,
      ref: "School",
      required: true,
    },
  },
  configModel.options
);
export default mongoose.model("ScratchCard", ScratchCard);
