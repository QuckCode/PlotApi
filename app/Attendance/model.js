import mongoose from "mongoose";
import configModel from "../utils/configModel";
const { ObjectId } = mongoose.Types;

const Attendance = new mongoose.Schema(
  {
    totalTimeSchoolOpened: {
      type: Number,
    },
    school: {
      type: ObjectId,
      ref: "School",
    },
  },
  configModel.options
);

export default mongoose.model("Attendance", Attendance);
