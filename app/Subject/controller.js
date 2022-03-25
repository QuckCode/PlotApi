import Subject from "./model";
import School from "@app/School/model";
import {
  APIError,
  DuplicateError,
  InValidParameterError,
  MissingParameterError,
} from "@errors/baseErrors";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

const createSubject = async (req, res, next) => {
  const { name, school } = req.body;

  if (!name) throw new MissingParameterError("Subject name");
  if (!school) throw new MissingParameterError("School");

  try {
    let foundSubject = await Subject.findOne({
      name: { $regex: new RegExp("^" + name.toLowerCase(), "i") },
      school: ObjectId(school),
    });

    if (foundSubject) throw new DuplicateError("Duplicate Subject");

    await Subject.create({ name, school });
    return res.send({
      status: "success",
      message: "Created Subject Successfully",
    });
  } catch (error) {
    throw new APIError(error.title, error.message);
  }
};

const fetchSubject = async (req, res, next) => {
  const { school } = req.params;
  if (!school) throw new MissingParameterError("School");

  if (!(await School.validateById(school)))
    throw new InValidParameterError("School");

  try {
    let subjects = await Subject.find({ school }).lean();
    return res.send(subjects);
  } catch (error) {
    throw new APIError(error.title, error.message);
  }
};

const deleteSubject = async (req, res, next) => {
  const { subject, school } = req.body;

  if (!subject) throw new MissingParameterError("Subject");
  if (!school) throw new MissingParameterError("School");

  if (!(await Subject.validateById(subject)))
    throw new InValidParameterError("Subject");

  if (!(await School.validateById(school)))
    throw new InValidParameterError("School");

  try {
    let foundSubject = await Subject.findByIdAndRemove(subject).lean();
    return res.send({
      status: "success",
      message: `Deleted ${foundSubject.name} Subject Successfully`,
    });
  } catch (error) {
    throw new APIError(error.title, error.message);
  }
};

const createSubjectGroup = async (req, res, next) => {
  // const {} = req.body;
};

const editSubjectGroup = async (req, res, next) => {};

const deleteSubjectGroup = async (req, res, next) => {};

export default { createSubject, fetchSubject, deleteSubject };
