import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;
import configModel from "../utils/configModel";

const Arm = new mongoose.Schema(
  {
    character: {
      required: true,
      type: String,
    },
    classes: {
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

export default mongoose.model("Arm", Arm);
