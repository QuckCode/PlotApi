const mongoose = require("mongoose");
const configModel = require("../utils/configModel");

const School = new mongoose.Schema(
  {
    name: {
      required: true,
      type: String,
      index: true,
    },
    schoolId: {
      type: String,
      index: true,
    },
    schoolPrefix: {
      index: true,
      required: true,
      type: String,
    },
    address: {
      required: true,
      type: String,
    },
    phoneNumber: {
      required: true,
      type: String,
    },
    email: {
      required: true,
      type: String,
    },
    abbreviatedName: {
      type: String,
    },
    section: {
      type: String,
      required: true,
      default: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
    },
    term: {
      type: String,
      enum: ["First", "Second", "Third"],
      required: true,
      default: "First",
    },
    openedDays: {
      type: Number,
      default: 0,
    },
    notice: [
      {
        type: String,
      },
    ],
    previousSchoolSection: [
      {
        type: String,
      },
    ],
    logo: {
      type: String,
    },
    images: [
      {
        type: String,
      },
    ],
    faceBookBio: {
      type: String,
      default: "https://facebook.com/",
    },
    twitterBio: {
      type: String,
      default: "https://twitter.com",
    },
    youtubeBio: {
      type: String,
      default: "https://youtube.com/",
    },
    instagramBio: {
      type: String,
      default: "https://www.instagram.com",
    },
    schoolImageAsBlob: {
      type: String,
      default: " ",
      required: true,
    },
  },
  configModel.options
);

School.statics.validateById = async function (id) {
  let school = await this.findById(id);
  if (!school) {
    return false;
  }
  return true;
};

module.exports = mongoose.model("School", School);
