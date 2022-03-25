const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const configModel = require("../utils/configModel");

const ResultSkill = new mongoose.Schema(
  {
    admissionNumber: {
      type: String,
      required: true,
    },
    studentId: {
      type: ObjectId,
      ref: "Student",
      required: true,
    },
    skillScores: [
      {
        score: {
          type: Number,
          required: true,
        },
        skill: {
          type: String,
          required: true,
        },
        skillId: {
          type: ObjectId,
          ref: "Skill",
          required: true,
        },
      },
    ],
    term: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    arm: {
      type: ObjectId,
      ref: "Arm",
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

module.exports = mongoose.model("ResultSkill", ResultSkill);
