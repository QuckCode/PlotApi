var mongoose = require("mongoose");
import configModel from "../utils/configModel";
import crypto from "../utils/crypto";
const { ObjectId } = mongoose.Types;

const Student = new mongoose.Schema(
  {
    admissionNumber: {
      required: true,
      type: String,
      unique: true,
    },
    admissionDate: {
      required: true,
      type: Date,
    },
    dob: {
      required: true,
      type: Date,
    },
    passport: {
      type: String,
      default:
        "https://test323hxshs.s3.us-east-2.amazonaws.com/3d2ac82f-3420-4ead-8a8a-6f882a00c3cc.png",
    },
    firstName: {
      required: true,
      type: String,
    },
    srnName: {
      required: true,
      type: String,
    },
    middleName: {
      default: " ",
      type: String,
    },
    class: {
      type: ObjectId,
      ref: "Class",
    },
    arm: {
      type: ObjectId,
      ref: "Arm",
    },
    password: {
      type: String,
      default: crypto.encrypt("password1"),
    },
    gender: {
      type: Boolean,
      required: true,
    },
    address: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    school: {
      type: ObjectId,
      ref: "School",
    },
    state: {
      type: String,
    },
    lga: {
      type: String,
    },
    phone: {
      type: String,
      default: "",
    },
    behaviourScores: [
      {
        behaviour: {
          ref: "Behaviour",
          type: ObjectId,
          required: true,
        },
        score: {
          type: Number,
          default: 1,
          enum: [1, 2, 3, 4, 5],
          required: true,
        },
        class: {
          ref: "Class",
          type: ObjectId,
          required: true,
        },
      },
    ],
    skillScores: [
      {
        skill: {
          ref: "Skill",
          type: ObjectId,
        },
        score: {
          type: Number,
          default: 1,
          enum: [1, 2, 3, 4, 5],
        },
        class: {
          ref: "Class",
          type: ObjectId,
        },
      },
    ],
    testScores: [
      {
        test: {
          ref: "Test",
          type: ObjectId,
          required: true,
        },
        score: {
          type: Number,
          required: true,
        },
        subject: {
          ref: "Subject",
          type: ObjectId,
          required: true,
        },
        class: {
          ref: "Class",
          type: ObjectId,
          required: true,
        },
      },
    ],
    present: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      default: true,
    },
  },
  configModel.options
);

export default mongoose.model("Student", Student);
