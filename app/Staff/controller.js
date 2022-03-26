import {
  APIError,
  InValidParameterError,
  MissingParameterError,
} from "@errors/baseErrors";
import Staff from "./model";
import { missingParameterError } from "../utils/error";
import jwt from "jsonwebtoken";
import config from "@config";
import moment from "moment";
import { isValidSchoolById } from "../School/functions";
import School from "../School/model";

const createStaff = async (req, res, next) => {
  const {
    firstName,
    middleName,
    srnName,
    gender,
    school,
    email,
    employmentDate,
    address,
    phone,
    dob,
  } = req.body;

  if (!firstName) throw new MissingParameterError("First Name");
  if (!srnName) return next(new MissingParameterError("Last Name"));
  if (!gender) return next(new MissingParameterError("Gender"));
  if (!school) return next(new MissingParameterError("School"));
  if (!dob) return next(new MissingParameterError("date of birth"));

  if (await !isValidSchoolById(school)) {
    return next(new APIError("User Error", "School Does not exist"));
  }

  try {
    const { schoolPrefix } = await School.findOne({ _id: school })
      .lean()
      .exec();

    let staffData = {
      name: {
        firstName: firstName,
        middleName: middleName,
        srnName: srnName,
      },
      phone,
      address,
      dob,
      gender: gender === 1 ? true : false,
      email,
      school,
      employmentDate,
      salary: 0,
    };

    let lastStaff = await Staff.find({ school })
      .sort({ _id: -1 })
      .limit(1)
      .lean()
      .exec();

    // Get The last staff  id and add to that to  get the new staff id

    if (lastStaff !== null) {
      let regNumber = lastStaff[0].regNumber;
      let startIndex = regNumber.indexOf("/staff/");
      let currentNumber = parseInt(regNumber.slice(startIndex + 7));
      staffData.regNumber = `${schoolPrefix}/staff/${currentNumber + 1}`;
      let staff = new Staff(staffData);
      await staff.save();
      return res.send({ title: "Created Staff ", message: "Success" });
    }

    staffData.regNumber = `${schoolPrefix}/staff/0`;
    let staff = new Staff(staffData);
    await staff.save();
    return res.send({ title: "Created Staff Admin ", message: "Success" });
  } catch (error) {
    console.log(error);
    return next(new APIError(error.title, error.message));
  }
};

const fetchStaff = async (req, res, next) => {
  const { school } = req.params;
  if (!school)
    return next(
      new APIError("Missing Parameter", missingParameterError("School"))
    );

  try {
    let staffs = await Staff.find({ school }).select("-password").lean().exec();

    return res.send(staffs);
  } catch (error) {
    return next(new APIError(error.title, error.message));
  }
};

const fetchStaffSubjects = async (req, res, next) => {
  const { staffId } = req.params;
  if (!staffId) throw new MissingParameterError("Staff   Id");

  try {
    let staff = await Staff.findById(staffId)
      .lean()
      .populate("subjects", "name _id");
    if (!staff) {
      throw next(new InValidParameterError("Staff ID"));
    }

    return res.send(staff.subjects);
  } catch (error) {
    throw new APIError(error.title, error.message);
  }
};

const addStaffSubject = async (req, res, next) => {
  try {
    let { userId, regNumber, subjects } = req.body;

    if (!userId) throw new MissingParameterError("User Id");
    if (!regNumber) throw new MissingParameterError("Reg Number");
    if (!subjects) throw new MissingParameterError("Subjects");
    if (subjects.length === 0)
      throw new MissingParameterError("You did not select any subjects ");

    let staff = await Staff.findById(userId).lean();

    await Staff.findOneAndUpdate(
      { _id: staff._id, regNumber },

      { $addToSet: { subjects: subjects } }
    );

    return res.send({ title: "Added Staff Subject ", message: "Successfully" });
  } catch (error) {
    return next(new APIError(error.title, error.message));
  }
};

const removeStaffSubject = async (req, res, next) => {
  try {
    let { userId, regNumber, subjects } = req.body;

    if (!userId) throw new MissingParameterError("User Id");
    if (!regNumber) throw new MissingParameterError("Reg Number");
    if (!subjects) throw new MissingParameterError("Subjects");
    if (subjects.length === 0)
      throw new MissingParameterError("You did not select any subjects ");

    let staff = await Staff.findById(userId).lean();

    await Staff.findOneAndUpdate(
      { _id: staff._id, regNumber },

      { $pullAll: { subjects: subjects } }
    );

    return res.send({
      title: "Removed Staff Subject ",
      message: "Successfully",
    });
  } catch (error) {
    return next(new APIError(error.title, error.message));
  }
};

const fetchStaffClasses = async (req, res, next) => {
  const { staffId } = req.params;
  if (!staffId) throw new MissingParameterError("Staff   Id");

  try {
    let staff = await Staff.findById(staffId)
      .lean()
      .populate("classes", "name  _id section");

    if (!staff) {
      throw next(new InValidParameterError("Staff ID"));
    }

    let classes = [];

    for (let classItem of staff.classes) {
      let { section, name, _id, subjects } = classItem;
      classes.push({ _id, name, sectionId: section, subjects });
    }

    return res.send(classes);
  } catch (error) {
    throw new APIError(error.title, error.message);
  }
};

const addStaffClass = async (req, res, next) => {
  try {
    let { userId, regNumber, classes } = req.body;

    if (!userId) throw new MissingParameterError("User Id");
    if (!regNumber) throw new MissingParameterError("Reg Number");
    if (!classes) throw new MissingParameterError("Class");
    if (classes.length === 0)
      throw new MissingParameterError("You did not select any Classes");

    let staff = await Staff.findById(userId).lean();

    await Staff.findOneAndUpdate(
      { _id: staff._id, regNumber },

      { $addToSet: { classes: classes } }
    );
    return res.send({ title: "Added Staff Class ", message: "Successfully" });
  } catch (error) {
    return next(new APIError(error.title, error.message));
  }
};

const removeStaffClass = async (req, res, next) => {
  try {
    let { userId, regNumber, classes } = req.body;

    if (!userId) throw new MissingParameterError("User Id");
    if (!regNumber) throw new MissingParameterError("Reg Number");
    if (!classes) throw new MissingParameterError("Class");
    if (classes.length === 0)
      throw new MissingParameterError("You did not select any Classes");

    let staff = await Staff.findById(userId).lean();

    await Staff.findOneAndUpdate(
      { _id: staff._id, regNumber },

      { $pullAll: { classes: classes } }
    );

    return res.send({ title: "Remove Staff Class ", message: "Successfully" });
  } catch (error) {
    return next(new APIError(error.title, error.message));
  }
};

const login = function (passport) {
  return function (req, res, next) {
    passport.authenticate("staff", { session: false }, (err, staff, info) => {
      console.log(err, staff, info);
      if (err || !staff) {
        return next(new APIError("User Error", info.message, 400));
      }

      req.login(staff, { session: false }, (err) => {
        if (err) {
          return next(err);
        }
        staff = staff._doc;
        delete staff.password;
        staff.userType = "staff";
        // Provide data since user is not a proper serialized object
        const token = jwt.sign(
          {
            ...staff,
            exp: moment().add(2, "days").valueOf(),
          },
          config.SECRET
        );
        return res.json({
          success: true,
          token,
        });
      });
    })(req, res);
  };
};

const loginAdmin = function (passport) {
  return function (req, res, next) {
    passport.authenticate("admin", { session: false }, (err, staff, info) => {
      console.log(next);
      if (err || !staff) {
        return next(new APIError("User Error", info.message, 400));
      }

      req.login(staff, { session: false }, (err) => {
        if (err) {
          return next(err);
        }
        staff = staff._doc;
        delete staff.password;
        staff.userType = "admin";
        // Provide data since user is not a proper serialized object
        const token = jwt.sign(
          {
            ...staff,
            exp: moment().add(2, "days").valueOf(),
          },
          config.SECRET
        );
        return res.json({
          success: true,
          token,
        });
      });
    })(req, res);
  };
};

export default {
  createStaff,
  fetchStaff,
  fetchStaffClasses,
  addStaffClass,
  removeStaffClass,
  fetchStaffSubjects,
  addStaffSubject,
  removeStaffSubject,
  login,
  loginAdmin,
};
