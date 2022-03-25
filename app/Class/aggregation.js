import mongoose from "mongoose";

export const getAllStudentInClassAggregate = (classId) => {
  return [
    { $match: { _id: new mongoose.Types.ObjectId(classId) } },
    {
      $lookup: {
        from: "students",
        localField: "_id",
        foreignField: "class",
        as: "students",
      },
    },
    {
      $lookup: {
        from: "arms",
        localField: "_id",
        foreignField: "classes",
        as: "arms",
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
              class: "$name",
              arm: {
                $filter: {
                  input: "$arms",
                  as: "arm",
                  cond: { $eq: ["$$arm._id", "$$student.arm"] },
                },
              },
            },
          },
        },
      },
    },
    {
      $project: {
        students: {
          $map: {
            input: "$students",
            as: "student",
            in: {
              _id: "$$student._id",
              name: "$$student.name",
              gender: "$$student.gender",
              passport: "$$student.passport",
              address: "$$student.address",
              state: "$$student.state",
              dob: "$$student.dob",
              admissionNumber: "$$student.admissionNumber",
              class: "$$student.class",
              arm: { $arrayElemAt: ["$$student.arm", 0] },
            },
          },
        },
      },
    },
    {
      $project: {
        students: {
          $map: {
            input: "$students",
            as: "student",
            in: {
              name: "$$student.name",
              gender: "$$student.gender",
              passport: "$$student.passport",
              address: "$$student.address",
              state: "$$student.state",
              dob: "$$student.dob",
              admissionNumber: "$$student.admissionNumber",
              class: "$$student.class",
              arm: "$$student.arm.character",
              _id: "$$student._id",
            },
          },
        },
      },
    },
  ];
};
