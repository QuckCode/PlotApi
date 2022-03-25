import { missingParameterError } from "../utils/error";
import Student from "../Students/model";
import { APIError } from "@errors/baseErrors";
import mongoose from "mongoose";
import { isArray } from "lodash";
import {
  appendCountryCode,
  validatePhoneNumber,
} from "@config/helpers/phoneNumberFormat";
import Sms from "./model";
import axios from "axios";
const { ObjectId } = mongoose.Types;

const credentials = {
  username: "dandynamicx@gmail.com",
  apikey: "da8a8ddc0e028860ad0668aa00273fbe6968c701",
  sender: "BriliantSCH",
};

const getAllStudentPhoneNumber = (req, res, next) => {
  try {
    Student.aggregate([{ $project: { _id: 0, phone: 1 } }]).exec(
      (err, result) => {
        if (err) {
          console.log(err);
          return next(new APIError("User Error", err.message));
        }

        if (result.length === 0)
          return next(new APIError("User Error", "No Student was found"));
        return res.send(result.map((x) => x.phone));
      }
    );
  } catch (error) {
    return next(new APIError("User Error", error.message));
  }
};

const getAllStudentPhoneNumberInAClass = (req, res, next) => {
  const { classId } = req.params;

  if (!classId)
    return next(
      new APIError("Missing Parameter", missingParameterError("Class"))
    );

  console.log(classId);
  try {
    Student.aggregate([
      { $match: { class: new ObjectId(classId) } },
      { $project: { phone: 1 } },
    ]).exec((err, result) => {
      if (err) {
        console.log(err);
        return next(new APIError("User Error", err.message));
      }

      if (result.length === 0)
        return next(new APIError("User Error", "No Student was found"));
      return res.send(result.map((x) => x.phone));
    });
  } catch (error) {
    return next(new APIError("User Error", error.message));
  }
};

const getAllStudentPhoneNumberInAnArm = (req, res, next) => {
  const { arm, classId } = req.params;
  if (!arm)
    return next(
      new APIError("Missing Parameter", missingParameterError("Arm"))
    );
  if (!classId)
    return next(
      new APIError("Missing Parameter", missingParameterError("Class"))
    );
  try {
    Student.aggregate([
      { $match: { class: new ObjectId(classId), arm: new ObjectId(arm) } },
      { $project: { _id: 0, phone: 1 } },
    ]).exec((err, result) => {
      if (err) {
        console.log(err);
        return next(new APIError("User Error", err.message));
      }

      if (result.length === 0)
        return next(new APIError("User Error", "No Student was found"));
      return res.send(result.map((x) => x.phone));
    });
  } catch (error) {
    return next(new APIError("User Error", error.message));
  }
};

async function sendMessage(req, res, next) {
  const { phoneNumbers, message, school } = req.body;
  if (!school)
    return next(
      new APIError("Missing Parameter", missingParameterError("School"))
    );

  if (phoneNumbers.length == 0 || !isArray(phoneNumbers))
    return next(new APIError("Wrong parameter", "Please an error occured"));

  let validNumber = phoneNumbers
    .map(validatePhoneNumber)
    .filter(Boolean)
    .map(appendCountryCode);

  let smsObject = {
    SMS: {
      auth: { username: credentials.username, apikey: credentials.apikey },
      message: { sender: credentials.sender, messagetext: message, flash: "0" },
      recipients: { gsm: validNumber },
    },
  };

  axios
    .post("http://api.ebulksms.com:8080/sendsms.json", smsObject)
    .then(({ data }) => {
      if (data.response.status !== "SUCCESS") {
        return next(new APIError("User Error", data.response.status));
      } else {
        Sms.insertMany(
          validNumber.map((x) => {
            return {
              message: message,
              from: x.msidn,
              sentBy: credentials.sender,
              date: Date.now(),
              school,
            };
          })
        )
          .then(() => {
            return res.send(data);
          })
          .catch((err) => {
            console.log(err);
            return next(
              new APIError("System Error", "Message was sent but not save")
            );
          });
      }
    })
    .catch((err) => {
      return next(new APIError("User Error", err.message));
    });
}

async function getAllSchoolMessage(req, res, next) {
  const { school } = req.body;
  if (!school)
    return next(
      new APIError("Missing Parameter", missingParameterError("School"))
    );
  Sms.find({ school })
    .then((data) => {
      return res.send(data.reverse());
    })
    .catch((err) => {
      return next(new APIError("User Error", err.message));
    });
}

const getUserBalance = async (req, res, next) => {
  try {
    let response = await axios.get(
      "https://api.ebulksms.com:4433/balance/dandynamicx@gmail.com/da8a8ddc0e028860ad0668aa00273fbe6968c701"
    );
    return res.send({
      balance: response.data,
    });
  } catch (error) {
    return res.send({
      balance: 0,
    });
    // return next(new APIError(error.title, error.message));
  }
};

export default {
  getAllStudentPhoneNumber,
  getAllStudentPhoneNumberInAClass,
  getAllStudentPhoneNumberInAnArm,
  sendMessage,
  getAllSchoolMessage,
  getUserBalance,
};
