import School from "./model";
import {
  APIError,
  DuplicateError,
  InValidParameterError,
  MissingParameterError,
} from "@errors/baseErrors";
import Student from "../Students/model";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;
import { isValidSchoolById } from "../School/functions";

export const createSchool = async (req, res, next) => {
  const { name, prefix, address, phoneNumber, email, id } = req.body;
  if (!name) throw new MissingParameterError("School Name");
  if (!prefix) throw new MissingParameterError("School Prefix");
  if (!address) throw new MissingParameterError("Address");
  if (!phoneNumber) throw new MissingParameterError("Phone Number");
  if (!email) throw new MissingParameterError("Email");

  try {
    let school = await School.find({
      $or: [{ name: name }, { schoolPrefix: prefix }],
    }).lean();
    if (school.length === 0) {
      const newSchool = new School({
        _id: id ? id : new ObjectId(),
        name,
        schoolPrefix: prefix,
        address,
        phoneNumber,
        email,
        schoolId: `${prefix + (Math.floor(Math.random() * 1000000) + 1)}`,
      });
      await newSchool.save();
      return res.json({ message: "Created School" });
    }

    throw new DuplicateError("School");
  } catch (error) {
    throw new APIError(error.title, error.message);
  }
};

export const getSchoolsSetting = async (req, res, next) => {
  const { school } = req.params;
  if (!school) throw new MissingParameterError("School");
  try {
    let schoolFound = await School.findById(school).lean();

    if (!schoolFound)
      throw new APIError("School Not Found", "School was not found ");

    return res.send(schoolFound);
  } catch (error) {
    throw new APIError(error.title || "Strange Error", error.message);
  }
};

export const editSchoolsSetting = async (req, res, next) => {
  const {
    school,
    term,
    name,
    schoolPrefix,
    address,
    phoneNumber,
    email,
    section,
  } = req.body;

  if (!school) throw new MissingParameterError("School");
  if (!name) throw new MissingParameterError("Name");
  if (!schoolPrefix) throw new MissingParameterError("Prefix");
  if (!address) throw new MissingParameterError("Address");
  if (!phoneNumber) throw new MissingParameterError("Phone Number");
  if (!email) throw new MissingParameterError("Email");
  if (!term) throw new MissingParameterError("Term");
  if (!section) throw new MissingParameterError("Section");

  try {
    let schoolFound = await School.findById(school).lean().exec();
    if (schoolFound.term !== term) {
      await Student.updateMany(
        { school: school },
        { $set: { testScores: [], skillScores: [], behaviourScores: [] } }
      );
      schoolFound.term = term;
      await School.findOneAndUpdate({ _id: schoolFound._id }, { term });
      return res.send({ message: "Saved Setting " });
    }

    if (schoolFound.section !== section) {
      await Student.updateMany(
        { school: school },
        { $set: { testScores: [], skillScores: [], behaviourScores: [] } }
      );
      schoolFound.previousSchoolSection.push(schoolFound.section);
      // await schoolFound.save();
      await School.findOneAndUpdate(
        { _id: schoolFound._id },
        { ...schoolFound, section }
      );
      return res.send({ message: "Saved Setting " });
    }

    await School.findByIdAndUpdate(school, { ...req.body });
    return res.send({ message: "Saved Setting " });
  } catch (error) {
    throw new APIError(error.title || "Strange Error", error.message);
  }
};

export const getSchools = async (req, res, next) => {
  try {
    let schools = await School.find().lean();
    return res.send(schools);
  } catch (error) {
    throw new APIError(error.title || "Strange Error", error.message);
  }
};

export const deleteSchool = async (req, res, next) => {
  const { school } = req.body;
  if (!school) throw new MissingParameterError("School Name");

  if (!(await isValidSchoolById(school)))
    throw new InValidParameterError("School");

  try {
    let foundSchool = await School.findByIdAndDelete(school);
    return res.send({
      message: `Deleted School With Name ${foundSchool.name}`,
    });
  } catch (error) {
    throw new APIError(error.title || "Strange Error", error.message);
  }
};

export const addNotice = (req, res, next) => {
  const { school, message } = req.body;
  if (!school) throw new MissingParameterError("School");
  if (!message) throw new MissingParameterError("Message");
  School.findById(school)
    .then((schoolData) => {
      schoolData.notice.push(message);
      schoolData.save().then(() => res.send({ message: "Saved Setting " }));
    })
    .catch((error) => {
      throw new APIError(error.title || "Strange Error", error.message);
    });
};

export const deleteNotice = (req, res, next) => {
  const { school, message } = req.body;
  if (!school) throw new MissingParameterError("School");
  if (!message) throw new MissingParameterError("Message");
  School.findById(school)
    .then((schoolData) => {
      schoolData.notice.pop(message);
      schoolData.save().then(() => res.send({ message: "Saved Setting " }));
    })
    .catch((error) => {
      throw new APIError(error.title || "Strange Error", error.message);
    });
};

export default {
  createSchool,
  getSchools,
  getSchoolsSetting,
  editSchoolsSetting,
  deleteSchool,
  addNotice,
  deleteNotice,
};
