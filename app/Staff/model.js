import mongoose from "mongoose";
// import { user, admin, staff, female, male } from "../../constants/SchemaEnum";
import configModel from "../utils/configModel";
import crypto from "../utils/crypto";
const { ObjectId } = mongoose.Types;

var Staff = new mongoose.Schema(
  {
    name: {
      firstName: {
        required: true,
        type: String,
      },
      middleName: {
        type: String,
      },
      srnName: {
        required: true,
        type: String,
      },
    },
    employmentDate: {
      required: true,
      type: Date,
    },
    dob: {
      required: true,
      type: Date,
    },
    gender: {
      required: true,
      type: Boolean,
    },
    active: {
      type: Boolean,
      default: true,
    },
    password: {
      type: String,
      required: true,
      default: crypto.encrypt("password1"),
    },
    passport: {
      type: String,
      default:
        "https://test323hxshs.s3.us-east-2.amazonaws.com/3d2ac82f-3420-4ead-8a8a-6f882a00c3cc.png",
    },
    department: {
      type: ObjectId,
      ref: "Department",
    },
    school: {
      required: true,
      type: ObjectId,
    },
    regNumber: {
      required: true,
      unique: true,
      type: String,
    },
    designation: {
      type: ObjectId,
      ref: "Designation",
    },
    type: {
      type: String,
      enum: ["Staff", "Admin"],
      default: "Staff",
    },
    classes: [
      {
        type: ObjectId,
        ref: "Class",
      },
    ],
    subjects: [
      {
        type: ObjectId,
        ref: "Subject",
      },
    ],
  },
  configModel.options
);

export default mongoose.model("Staff", Staff);
