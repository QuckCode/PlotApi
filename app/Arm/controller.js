import Arm from "./model";
import { APIError, MissingParameterError } from "@errors/baseErrors";
import mongoose from "mongoose";
import { missingParameterError } from "@app/utils/error";
const createArm = (req, res, next) => {
  const { arm, classes, school } = req.body;
  if (!arm) throw new MissingParameterError("Arm");
  if (!classes) throw new MissingParameterError("Classes");
  if (!school) throw new MissingParameterError("School");

  try {
    Arm.create({ character: arm, classes, school });
    return res.send({
      status: "Success",
      message: "Create User Successfully ",
    });
  } catch (error) {
    throw new APIError(error.title, error.message);
  }
};

const fetchArm = (req, res, next) => {
  const { school } = req.params;
  if (!school)
    throw new APIError("Missing Parameter", missingParameterError("School"));

  Arm.find({ school })
    .populate({
      path: "classes",
      select: "name _id",
      populate: {
        path: "section",
        model: "Sections",
        select: "section -_id",
      },
    })
    .lean()
    .exec()
    .then((data) => {
      let dataRes = data.map((d) => {
        if (d.classes == null) return;
        return {
          id: d._id,
          arm: d.character,
          class: d.classes.name,
          section: d.classes.section.section,
          classID: d.classes._id,
        };
      });
      res.send(
        dataRes.filter(function (el) {
          return el != null;
        })
      );
    })
    .catch((err) => {
      console.log(err);
      return next(new APIError("User Error", "please an error occurred"));
    });
};

const getAllStudentInArm = (req, res, next) => {
  const { arm } = req.params;
  if (!arm)
    return next(
      new APIError("Missing Parameter", missingParameterError("Arm"))
    );

  try {
    Arm.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(arm) } },
      {
        $lookup: {
          from: "classes",
          localField: "classes",
          foreignField: "_id",
          as: "class",
        },
      },
      {
        $project: { arm: "$character", class: { $arrayElemAt: ["$class", 0] } },
      },
      { $project: { arm: 1, class: "$class.name" } },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "arm",
          as: "students",
        },
      },
      {
        $project: {
          students: {
            $map: {
              input: "$students",
              as: "student",
              in: {
                name: {
                  $concat: [
                    "$$student.firstName",
                    " ",
                    "$$student.middleName",
                    " ",
                    "$$student.srnName",
                  ],
                },
                _id: "$$student._id",
                gender: "$$student.gender",
                passport: "$$student.passport",
                address: "$$student.address",
                state: "$$student.state",
                dob: "$$student.dob",
                admissionNumber: "$$student.admissionNumber",
                class: "$class",
                arm: "$arm",
                subjectGroup: "$$student.subjectGroup",
                present: "$$student.present",
              },
            },
          },
        },
      },
    ]).exec((err, result) => {
      if (err) {
        console.log(err);
        return next(new APIError("User Error", err.message));
      }
      if (result.length === 0)
        return next(new APIError("User Error", "No Class Arm with this Id"));
      if (result[0].students.length === 0)
        return next(
          new APIError("User Error", "No Students in this Class Arm")
        );
      return res.send(result[0].students);
    });
  } catch (error) {
    return next(new APIError("User Error", error));
  }
};

export default { createArm, fetchArm, getAllStudentInArm };
