import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;
import configModel from "../utils/configModel";

const Departments = new mongoose.Schema(
  {
    name: {
      required: true,
      type: String,
    },
    school: {
      type: ObjectId,
      ref: "School",
    },
  },
  configModel.options
);

export default mongoose.model("Department", Departments);
