import Test from "./model";
import Arm from "@app/Arm/model";
import School from "@app/School/model";
import { missingParameterError } from "../utils/error";
import {
  APIError,
  DuplicateError,
  InValidParameterError,
  MissingParameterError,
} from "@errors/baseErrors";
import mongoose from "mongoose";
import {
  continuosAssessmentSheetAllSubjectAggregation,
  continuosAssessmentSheetSingleSubjectAggregation,
} from "./aggregate";
const { ObjectId } = mongoose.Types;

const createTest = async (req, res, next) => {
  const { name, school, marksObtainable, parentageOfTotal } = req.body;
  if (!name) throw new MissingParameterError("Test name");

  if (!school) throw new MissingParameterError("School");

  if (!marksObtainable)
    throw new MissingParameterError("Total Marks Obtainable");

  if (!parentageOfTotal)
    throw new MissingParameterError("Percentage Of Total Score");

  try {
    let foundTest = await Test.findOne({
      name: { $regex: new RegExp("^" + name.toLowerCase(), "i") },
      school: ObjectId(school),
      marksObtainable: marksObtainable,
      parentageOfTotal: parentageOfTotal,
    }).lean();

    if (foundTest) {
      throw new DuplicateError("Duplicate Test");
    }

    await Test.create({ name, school, marksObtainable, parentageOfTotal });
    return res.send({
      status: "success",
      message: "Create Test  Successfully ",
    });
  } catch (error) {
    throw new APIError(error.title, error.message);
  }
};

const fetchTest = async (req, res, next) => {
  const { school } = req.params;
  if (!school) throw new MissingParameterError("School");

  if (!(await School.validateById(school)))
    throw new InValidParameterError("School");

  try {
    let tests = await Test.find({ school }).lean();
    return res.send(tests);
  } catch (error) {
    throw new APIError(error.title, error.message);
  }
};

const deleteTest = async (req, res, next) => {
  const { test, school } = req.body;

  if (!test) throw new MissingParameterError("Test");
  if (!school) throw new MissingParameterError("School");

  if (!(await Test.validateById(test))) throw new InValidParameterError("Test");

  if (!(await School.validateById(school)))
    throw new InValidParameterError("School");

  try {
    let foundTest = await Test.findByIdAndRemove(test).lean();
    return res.send({
      status: "success",
      message: `Deleted ${foundTest.name} Test Successfully`,
    });
  } catch (error) {
    throw new APIError(error.title, error.message);
  }
};

const continuosAssessmentSheetAllSubject = (req, res, next) => {
  const { armId, classId } = req.body;
  if (!armId)
    throw new APIError("Missing Parameter", missingParameterError("Arm"));
  if (!classId)
    throw new APIError("Missing Parameter", missingParameterError("Class"));
  try {
    Arm.aggregate(
      continuosAssessmentSheetAllSubjectAggregation(armId, classId)
    ).exec((err, result) => {
      if (err) throw new APIError("User Error", err.message);
      if (result.length === 0)
        return new APIError(
          "Form Could Not Be Generate",
          "No Sheet were generated"
        );
      return res.send(result);
    });
  } catch (error) {
    throw new APIError("User Error", error.message);
  }
};

const continuosAssessmentSheetSingleSubject = (req, res, next) => {
  const { armId, classId, subjectId } = req.body;
  if (!armId)
    throw new APIError("Missing Parameter", missingParameterError("Arm"));
  if (!classId)
    throw new APIError("Missing Parameter", missingParameterError("Class"));
  if (!subjectId)
    throw new APIError("Missing Parameter", missingParameterError("Subject"));
  try {
    Arm.aggregate(
      continuosAssessmentSheetSingleSubjectAggregation(
        armId,
        classId,
        subjectId
      )
    ).exec((err, result) => {
      if (err) throw new APIError("User Error", err.message);
      if (result.length === 0)
        return new APIError(
          "Form Could Not Be Generate",
          "No Sheet were generated"
        );
      return res.send(result);
    });
  } catch (error) {
    throw new APIError("User Error", error.message);
  }
};

export default {
  createTest,
  fetchTest,
  deleteTest,
  continuosAssessmentSheetAllSubject,
  continuosAssessmentSheetSingleSubject,
};
