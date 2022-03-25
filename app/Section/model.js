const mongoose = require("mongoose");
const configModel = require("../utils/configModel");

const Section = new mongoose.Schema(
  {
    section: {
      required: true,
      type: String,
    },
    behaviors: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Behaviour",
        },
      ],
      default: [],
    },
    skills: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Skill",
        },
      ],
      default: [],
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
  },
  configModel.options
);

Section.statics.validateById = async function (id) {
  let section = await this.findById(id);
  if (!section) {
    return true;
  }
  return false;
};

export default mongoose.model("Sections", Section);
