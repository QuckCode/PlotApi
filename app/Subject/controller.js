import Subject from "./model";
import School from "@app/School/model";
import SubjectGroup from "./SubjectGroupModel";
import {
  APIError,
  DuplicateError,
  InValidParameterError,
  MissingParameterError,
} from "@errors/baseErrors";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

const createSubject = async (req, res, next) => {
  try {
    const { name, school } = req.body;

    if (!name) throw new MissingParameterError("Subject name");
    if (!school) throw new MissingParameterError("School");

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
    return next(new APIError(error.title, error.message));
  }
};

const fetchSubject = async (req, res, next) => {
  try {
    const { school } = req.params;
    if (!school) throw new MissingParameterError("School");

    if (!(await School.validateById(school)))
      throw new InValidParameterError("School");
    let subjects = await Subject.find({ school }).lean();
    return res.send(subjects);
  } catch (error) {
    return next(new APIError(error.title, error.message));
  }
};

const deleteSubject = async (req, res, next) => {
  try {
    const { subject, school } = req.body;

    if (!subject) throw new MissingParameterError("Subject");
    if (!school) throw new MissingParameterError("School");

    if (!(await Subject.validateById(subject)))
      throw new InValidParameterError("Subject");

    if (!(await School.validateById(school)))
      throw new InValidParameterError("School");

    let foundSubject = await Subject.findByIdAndRemove(subject).lean();
    return res.send({
      status: "success",
      message: `Deleted ${foundSubject.name} Subject Successfully`,
    });
  } catch (error) {
    return next(new APIError(error.title, error.message));
  }
};

const createSubjectGroup = async (req, res, next) => {
  try {
    const { name, subjects, school } = req.body;
    if (!name) throw new MissingParameterError("Subject name");
    if (!school) throw new MissingParameterError("School");
    if (!subjects) throw new MissingParameterError("Subjects");
    if (subjects.length === 0)
      throw new MissingParameterError("You did not Select Any Subjects");

    let foundSubject = await SubjectGroup.findOne({
      name: { $regex: name, $options: "i" },
      school,
    });

    if (foundSubject !== null)
      throw new APIError(
        "Subject Group Exist",
        "This Subject Group Already Exist"
      );

    for (let subjectId of subjects) {
      await Subject.validateById(subjectId);
    }

    let subjectGroup = new SubjectGroup({
      name,
      subjects,
      school,
    });

    await subjectGroup.save();
    return res.send({
      status: "success",
      message: `Created ${name} Subject Group Successfully`,
    });
  } catch (error) {
    return next(new APIError(error.title, error.message));
  }
};

const fetchSubjectGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    let subjectGroup = await SubjectGroup.findById(id)
      .lean()
      .populate("subjects");
    if (subjectGroup === null)
      throw new APIError("Subject Error", "Subject was Not Found");
    return res.send(subjectGroup);
  } catch (error) {
    return next(new APIError(error.title, error.message));
  }
};

const editSubjectGroup = async (req, res, next) => {
  try {
    const { name, subjects, id } = req.body;
    let subjectGroup = await SubjectGroup.findById(id);
    if (subjectGroup === null)
      throw new APIError("Subject Error", "Subject was Not Found");
    subjectGroup.name = name;
    subjectGroup.subjects = subjects;
    subjectGroup.save();
    return res.send({
      status: "success",
      message: `Edited ${name} Subject Group Successfully`,
    });
  } catch (error) {
    return next(new APIError(error.title, error.message));
  }
};

const deleteSubjectGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(id);
    let subjectGroup = await SubjectGroup.findByIdAndRemove(id);
    let { name } = subjectGroup;
    return res.send({
      status: "success",
      message: `Deleted ${name} Subject Group Successfully`,
    });
  } catch (error) {
    return next(new APIError(error.title, error.message));
  }
};

const fetchSubjectGroupBySchool = async (req, res, next) => {
  try {
    const { schoolId } = req.params;
    let subjectGroup = await SubjectGroup.find({
      school: ObjectId(schoolId),
    })
      .lean()
      .select("name");

    if (subjectGroup === null)
      throw new APIError("Subject Error", "Subject was Not Found");
    return res.send(subjectGroup);
  } catch (error) {
    return next(new APIError(error.title, error.message));
  }
};

export default {
  createSubject,
  fetchSubject,
  deleteSubject,
  createSubjectGroup,
  fetchSubjectGroup,
  editSubjectGroup,
  deleteSubjectGroup,
  fetchSubjectGroupBySchool,
};
