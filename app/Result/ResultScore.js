const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const configModel = require("../utils/configModel");

const ResultScore = new mongoose.Schema(
  {
    studentResults: [
      {
        name: {
          type: String,
          required: true,
        },
        admissionNumber: {
          type: String,
          required: true,
        },
        studentId: {
          type: ObjectId,
          ref: "Student",
          required: true,
        },
        total: {
          type: Number,
          required: true,
        },
        avg: {
          type: Number,
          required: true,
        },
        high: {
          type: Number,
          required: true,
        },
        postion: {
          type: Number,
          required: true,
        },
        low: {
          type: Number,
          required: true,
        },
        scores: [
          {
            score: {
              type: Number,
              required: true,
            },
            test: {
              type: String,
              required: true,
            },
          },
        ],
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
    subject: {
      type: ObjectId,
      ref: "Subjects",
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

module.exports = mongoose.model("ResultScore", ResultScore);
