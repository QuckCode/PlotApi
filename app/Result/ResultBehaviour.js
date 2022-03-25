const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const configModel = require("../utils/configModel");

const ResultBehaviour = new mongoose.Schema(
  {
    studentId: {
      type: ObjectId,
      ref: "Student",
      required: true,
    },
    admissionNumber: {
      type: String,
      required: true,
    },
    behaviours: [
      {
        type: ObjectId,
        ref: "Behaviour",
        required: true,
      },
    ],
    behaviourScores: [
      {
        score: {
          type: Number,
          required: true,
        },
        behaviour: {
          type: String,
          required: true,
        },
        behaviourId: {
          type: ObjectId,
          ref: "Behaviour",
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

module.exports = mongoose.model("ResultBehaviour", ResultBehaviour);
