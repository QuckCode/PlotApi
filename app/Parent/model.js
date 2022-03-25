const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const configModel = require("@app/utils/configModel");

<<<<<<< HEAD
const Parent = new mongoose.Schema({
  image: {
    type: String,
    default: "",
=======
const Parent = new mongoose.Schema(
  {
    image: {
      type: String,
      default: "",
    },
    firstName: {
      required: true,
      type: String,
    },
    middleName: {
      required: true,
      type: String,
    },
    password: {
      type: String,
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
>>>>>>> main
  },
  name: {
    required: true,
    type: String,
  },
  password: {
    type: String,
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
});

<<<<<<< HEAD
export default mongoose.model("Parent", Parent);
=======
export default mongoose.model("User", Parent);
>>>>>>> main
