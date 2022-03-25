import mongoose from "mongoose";
import configModel from "../utils/configModel";
const { ObjectId } = mongoose.Types;

const StudentAttendance = new mongoose.Schema(
  {
    totalTimeStudentPresent: {
      type: Number,
    },
    school: {
      type: ObjectId,
      ref: "School",
    },
  },
  configModel.options
);
export default mongoose.model("StudentAttendance", StudentAttendance);
