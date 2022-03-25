import mongoose from "mongoose";
import configModel from "../utils/configModel";

const SportHouse = new mongoose.Schema(
  {
    character: {
      required: true,
      type: String,
    },
  },
  configModel.options
);
export default mongoose.model("SportHouse", SportHouse);
