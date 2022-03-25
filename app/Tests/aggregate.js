import { ObjectId } from "mongodb";

const continuosAssessmentSheetAllSubjectAggregation = (armId, classId) => {
  return [
    { $match: { _id: new ObjectId(armId), classes: new ObjectId(classId) } },
    {
      $lookup: {
        from: "schools",
        localField: "school",
        foreignField: "_id",
        as: "school",
      },
    },
    {
      $project: {
        _id: 1,
        character: 1,
        classes: 1,
        school: { $arrayElemAt: ["$school", 0] },
      },
    },
    {
      $lookup: {
        from: "students",
        localField: "_id",
        foreignField: "arm",
        as: "students",
      },
    },
    {
      $lookup: {
        from: "classes",
        localField: "classes",
        foreignField: "_id",
        as: "class",
      },
    },
    {
      $project: {
        _id: 1,
        character: 1,
        students: 1,
        school: 1,
        class: { $arrayElemAt: ["$class", 0] },
      },
    },
    {
      $project: {
        _id: 1,
        arm: "$character",
        class: "$class.name",
        tests: "$class.tests",
        subjects: "$class.subjects",
        school: 1,
        students: {
          $map: {
            input: "$students",
            as: "student",
            in: {
              id: "$$student._id",
              admissionNumber: "$$student.admissionNumber",
              name: {
                $concat: [
                  "$$student.firstName",
                  " ",
                  "$$student.middleName",
                  " ",
                  "$$student.srnName",
                ],
              },
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: "tests",
        localField: "tests",
        foreignField: "_id",
        as: "tests",
      },
    },
    {
      $lookup: {
        from: "subjects",
        localField: "subjects",
        foreignField: "_id",
        as: "subjects",
      },
    },
    {
      $project: {
        arm: 1,
        class: 1,
        students: 1,
        school: { name: 1, term: 1, section: 1 },
        subjects: {
          $map: {
            input: "$subjects",
            as: "subject",
            in: { _id: "$$subject._id", name: "$$subject.name" },
          },
        },
        tests: {
          $map: { input: "$tests", as: "test", in: { name: "$$test.name" } },
        },
      },
    },
    { $unwind: { path: "$subjects" } },
  ];
};

const continuosAssessmentSheetSingleSubjectAggregation = (
  armId,
  classId,
  subjectId
) => {
  return [
    { $match: { _id: new ObjectId(armId), classes: new ObjectId(classId) } },
    {
      $lookup: {
        from: "schools",
        localField: "school",
        foreignField: "_id",
        as: "school",
      },
    },
    {
      $project: {
        _id: 1,
        character: 1,
        classes: 1,
        school: { $arrayElemAt: ["$school", 0] },
      },
    },
    {
      $lookup: {
        from: "students",
        localField: "_id",
        foreignField: "arm",
        as: "students",
      },
    },
    {
      $lookup: {
        from: "classes",
        localField: "classes",
        foreignField: "_id",
        as: "class",
      },
    },
    {
      $project: {
        _id: 1,
        character: 1,
        students: 1,
        school: 1,
        class: { $arrayElemAt: ["$class", 0] },
      },
    },
    {
      $project: {
        _id: 1,
        arm: "$character",
        class: "$class.name",
        tests: "$class.tests",
        subjects: "$class.subjects",
        school: 1,
        students: {
          $map: {
            input: "$students",
            as: "student",
            in: {
              id: "$$student._id",
              admissionNumber: "$$student.admissionNumber",
              name: {
                $concat: [
                  "$$student.firstName",
                  " ",
                  "$$student.middleName",
                  " ",
                  "$$student.srnName",
                ],
              },
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: "tests",
        localField: "tests",
        foreignField: "_id",
        as: "tests",
      },
    },
    {
      $lookup: {
        from: "subjects",
        localField: "subjects",
        foreignField: "_id",
        as: "subjects",
      },
    },
    {
      $project: {
        arm: 1,
        class: 1,
        students: 1,
        school: { name: 1, term: 1, section: 1 },
        subjects: {
          $map: {
            input: "$subjects",
            as: "subject",
            in: { _id: "$$subject._id", name: "$$subject.name" },
          },
        },
        tests: {
          $map: { input: "$tests", as: "test", in: { name: "$$test.name" } },
        },
      },
    },
    { $unwind: { path: "$subjects" } },
    { $match: { "subjects._id": new ObjectId(subjectId) } },
  ];
};

export {
  continuosAssessmentSheetAllSubjectAggregation,
  continuosAssessmentSheetSingleSubjectAggregation,
};
