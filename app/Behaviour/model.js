import mongoose from "mongoose";
import configModel from "../utils/configModel";
const { ObjectId } = mongoose.Types;

const Behaviour = new mongoose.Schema(
  {
    name: {
      required: true,
      type: String,
      index: true,
    },
    school: {
      type: ObjectId,
      ref: "School",
      required: true,
    },
  },
  configModel.options
);

export default mongoose.model("Behaviour", Behaviour);
