const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const computeResult = (classN, arm) => {
  return [
    {
      $match: {
        class: new ObjectId(classN),
        arm: new ObjectId(arm),
      },
    },
    {
      $lookup: {
        from: "classes",
        localField: "class",
        foreignField: "_id",
        as: "class",
      },
    },
    { $unwind: { path: "$class" } },
    {
      $project: {
        tests: "$class.tests",
        subjects: "$class.subjects",
        admissionNumber: 1,
        studentId: "$_id",
        testScores: 1,
        firstName: 1,
        middleName: 1,
        srnName: 1,
        passport: 1,
        class: { _id: 1, name: 1 },
        arm: "$arm",
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
        admissionNumber: "$admissionNumber",
        firstName: 1,
        srnName: 1,
        middleName: 1,
        class: 1,
        arm: 1,
        passport: 1,
        subjects: "$subjects",
        studentId: 1,
        scores: {
          $map: {
            input: "$testScores",
            as: "scores",
            in: {
              score: "$$scores.score",
              subject: {
                $filter: {
                  input: "$subjects",
                  as: "sub",
                  cond: {
                    $cond: [
                      { $eq: ["$$sub._id", "$$scores.subject"] },
                      "$$sub",
                      null,
                    ],
                  },
                },
              },
              test: {
                $filter: {
                  input: "$tests",
                  as: "tes",
                  cond: {
                    $cond: [
                      { $eq: ["$$tes._id", "$$scores.test"] },
                      "$$tes",
                      null,
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      $project: {
        admissionNumber: "$admissionNumber",
        firstName: 1,
        studentId: 1,
        srnName: 1,
        middleName: 1,
        class: 1,
        arm: 1,
        passport: 1,
        subjects: 1,
        scores: {
          $map: {
            input: "$scores",
            as: "scores",
            in: {
              score: "$$scores.score",
              subject: { $arrayElemAt: ["$$scores.subject", 0] },
              test: { $arrayElemAt: ["$$scores.test", 0] },
            },
          },
        },
      },
    },
    { $unwind: { path: "$subjects" } },
    {
      $group: {
        _id: "$subjects._id",
        scoresAndStudent: {
          $push: {
            name: {
              $concat: ["$firstName", " ", "$middleName", " ", "$srnName"],
            },
            studentId: "$studentId",
            class: "$class._id",
            arm: "$arm",
            admissionNumber: "$admissionNumber",
            score: {
              $filter: {
                input: "$scores",
                as: "item",
                cond: { $eq: ["$$item.subject._id", "$subjects._id"] },
              },
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: "subjects",
        localField: "_id",
        foreignField: "_id",
        as: "subject",
      },
    },
    {
      $project: {
        scoresAndStudent: 1,
        subject: { $arrayElemAt: ["$subject", 0] },
      },
    },
    {
      $project: {
        scoresAndStudent: {
          $map: {
            input: "$scoresAndStudent",
            as: "scoreStu",
            in: {
              name: "$$scoreStu.name",
              studentId: "$$scoreStu.studentId",
              admissionNumber: "$$scoreStu.admissionNumber",
              class: "$$scoreStu.class",
              arm: "$$scoreStu.arm",
              score: {
                $map: {
                  input: "$$scoreStu.score",
                  as: "score",
                  in: { score: "$$score.score", test: "$$score.test.name" },
                },
              },
              total: {
                $reduce: {
                  input: "$$scoreStu.score",
                  initialValue: { score: 0 },
                  in: { score: { $add: ["$$value.score", "$$this.score"] } },
                },
              },
            },
          },
        },
      },
    },
    {
      $project: {
        scoresAndStudent: {
          $filter: {
            input: "$scoresAndStudent",
            as: "scoresAndStudent",
            cond: { $gt: ["$$scoresAndStudent.total.score", 0] },
          },
        },
      },
    },
    {
      $project: {
        scoresAndStudent: {
          $map: {
            input: "$scoresAndStudent",
            as: "scoreStu",
            in: {
              name: "$$scoreStu.name",
              studentId: "$$scoreStu.studentId",
              admissionNumber: "$$scoreStu.admissionNumber",
              scores: "$$scoreStu.score",
              total: "$$scoreStu.total.score",
              class: "$$scoreStu.class",
              arm: "$$scoreStu.arm",
              avg: { $toInt: { $avg: "$scoresAndStudent.total.score" } },
              high: { $max: "$scoresAndStudent.total.score" },
              low: { $min: "$scoresAndStudent.total.score" },
            },
          },
        },
      },
    },
    { $unwind: { path: "$scoresAndStudent" } },
    { $sort: { "scoresAndStudent.total": -1 } },
    { $group: { _id: "$_id", scoresAndStudent: { $push: "$$ROOT" } } },
    { $unwind: { path: "$scoresAndStudent", includeArrayIndex: "postion" } },
    {
      $project: {
        scoresAndStudent: "$scoresAndStudent.scoresAndStudent",
        postion: "$postion",
      },
    },
    {
      $replaceRoot: {
        newRoot: { $mergeObjects: ["$scoresAndStudent", "$$ROOT"] },
      },
    },
    {
      $project: {
        postion: { $add: ["$postion", 1] },
        studentId: 1,
        admissionNumber: 1,
        name: 1,
        scores: 1,
        total: 1,
        avg: 1,
        low: 1,
        high: 1,
        class: 1,
        arm: 1,
      },
    },
    { $group: { _id: "$_id", studentResults: { $push: "$$ROOT" } } },
    {
      $lookup: {
        from: "subjects",
        localField: "_id",
        foreignField: "_id",
        as: "subject",
      },
    },
    {
      $project: {
        studentResults: 1,
        class: { $arrayElemAt: ["$studentResults", 0] },
        arm: { $arrayElemAt: ["$studentResults", 0] },
        subject: { $arrayElemAt: ["$subject", 0] },
      },
    },
    {
      $project: {
        studentResults: 1,
        class: "$class.class",
        subject: "$subject._id",
        arm: "$arm.arm",
      },
    },
  ];
};

const viewResultAggregate = (term, section, arm, classN) => {
  return [
    { $match: { arm: new ObjectId(arm), class: new ObjectId(classN) } },
    {
      $lookup: {
        from: "resultscores",
        localField: "arm",
        foreignField: "arm",
        as: "resultScores",
      },
    },
    {
      $project: {
        skillScores: 0,
        behaviourScores: 0,
        testScores: 0,
        phone: 0,
        address: 0,
        password: 0,
        state: 0,
        lga: 0,
        admissionDate: 0,
        __v: 0,
        dob: 0,
      },
    },
    {
      $project: {
        name: { $concat: ["$firstName", " ", "$middleName", " ", "$srnName"] },
        admissionNumber: 1,
        passport: 1,
        gender: 1,
        class: 1,
        arm: 1,
        present: 1,
        resultScores: {
          $filter: {
            input: "$resultScores",
            as: "resultScore",
            cond: {
              $and: [
                { $eq: ["$$resultScore.term", term] },
                { $eq: ["$$resultScore.section", section] },
              ],
            },
          },
        },
        terms: {
          first: {
            $filter: {
              input: "$resultScores",
              as: "resultScore",
              cond: {
                $and: [
                  { $eq: ["$$resultScore.term", "First"] },
                  { $eq: ["$$resultScore.section", section] },
                ],
              },
            },
          },
          second: {
            $filter: {
              input: "$resultScores",
              as: "resultScore",
              cond: {
                $and: [
                  { $eq: ["$$resultScore.term", "Second"] },
                  { $eq: ["$$resultScore.section", section] },
                ],
              },
            },
          },
          third: {
            $filter: {
              input: "$resultScores",
              as: "resultScore",
              cond: {
                $and: [
                  { $eq: ["$$resultScore.term", "Third"] },
                  { $eq: ["$$resultScore.section", section] },
                ],
              },
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: "classes",
        localField: "class",
        foreignField: "_id",
        as: "class",
      },
    },
    {
      $lookup: {
        from: "arms",
        localField: "arm",
        foreignField: "_id",
        as: "arm",
      },
    },
    {
      $project: {
        present: 1,
        name: 1,
        admissionNumber: 1,
        passport: 1,
        gender: 1,
        class: { $arrayElemAt: ["$class", 0] },
        arm: { $arrayElemAt: ["$arm", 0] },
        resultScores: 1,
        terms: 1,
      },
    },
    {
      $project: {
        name: 1,
        admissionNumber: 1,
        passport: 1,
        gender: 1,
        subjects: "$class.subjects",
        class: "$class.name",
        arm: "$arm.character",
        resultScores: 1,
        terms: 1,
        present: 1,
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
        name: 1,
        gender: 1,
        passport: 1,
        class: 1,
        arm: 1,
        subjects: 1,
        admissionNumber: 1,
        present: 1,
        resultScores: {
          $map: {
            input: "$resultScores",
            as: "resultScore",
            in: {
              subject: "$$resultScore.subject",
              studentResults: "$$resultScore.studentResults",
            },
          },
        },
        terms: {
          first: {
            $map: {
              input: "$terms.first",
              as: "resultScore",
              in: {
                subject: "$$resultScore.subject",
                studentResults: "$$resultScore.studentResults",
              },
            },
          },
          second: {
            $map: {
              input: "$terms.second",
              as: "resultScore",
              in: {
                subject: "$$resultScore.subject",
                studentResults: "$$resultScore.studentResults",
              },
            },
          },
          third: {
            $map: {
              input: "$terms.third",
              as: "resultScore",
              in: {
                subject: "$$resultScore.subject",
                studentResults: "$$resultScore.studentResults",
              },
            },
          },
        },
      },
    },
    {
      $project: {
        name: 1,
        gender: 1,
        passport: 1,
        class: 1,
        arm: 1,
        subjects: 1,
        admissionNumber: 1,
        present: 1,
        terms: 1,
        resultScores: {
          $map: {
            input: "$resultScores",
            as: "resultScore",
            in: {
              subject: {
                $filter: {
                  input: "$subjects",
                  as: "subject",
                  cond: { $eq: ["$$resultScore.subject", "$$subject._id"] },
                },
              },
              studentResults: {
                $filter: {
                  input: "$$resultScore.studentResults",
                  as: "studentResult",
                  cond: { $eq: ["$$studentResult.studentId", "$_id"] },
                },
              },
            },
          },
        },
        terms: {
          first: {
            $map: {
              input: "$terms.first",
              as: "resultScore",
              in: {
                subject: {
                  $filter: {
                    input: "$subjects",
                    as: "subject",
                    cond: { $eq: ["$$resultScore.subject", "$$subject._id"] },
                  },
                },
                studentResults: {
                  $filter: {
                    input: "$$resultScore.studentResults",
                    as: "studentResult",
                    cond: { $eq: ["$$studentResult.studentId", "$_id"] },
                  },
                },
              },
            },
          },
          second: {
            $map: {
              input: "$terms.second",
              as: "resultScore",
              in: {
                subject: {
                  $filter: {
                    input: "$subjects",
                    as: "subject",
                    cond: { $eq: ["$$resultScore.subject", "$$subject._id"] },
                  },
                },
                studentResults: {
                  $filter: {
                    input: "$$resultScore.studentResults",
                    as: "studentResult",
                    cond: { $eq: ["$$studentResult.studentId", "$_id"] },
                  },
                },
              },
            },
          },
          third: {
            $map: {
              input: "$terms.third",
              as: "resultScore",
              in: {
                subject: {
                  $filter: {
                    input: "$subjects",
                    as: "subject",
                    cond: { $eq: ["$$resultScore.subject", "$$subject._id"] },
                  },
                },
                studentResults: {
                  $filter: {
                    input: "$$resultScore.studentResults",
                    as: "studentResult",
                    cond: { $eq: ["$$studentResult.studentId", "$_id"] },
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      $project: {
        name: 1,
        gender: 1,
        passport: 1,
        class: 1,
        arm: 1,
        admissionNumber: 1,
        present: 1,
        terms: 1,
        resultScores: {
          $map: {
            input: "$resultScores",
            as: "resultScore",
            in: {
              subject: { $arrayElemAt: ["$$resultScore.subject", 0] },
              studentResults: {
                $arrayElemAt: ["$$resultScore.studentResults", 0],
              },
            },
          },
        },
        terms: {
          first: {
            $map: {
              input: "$terms.first",
              as: "resultScore",
              in: {
                subject: { $arrayElemAt: ["$$resultScore.subject", 0] },
                studentResults: {
                  $arrayElemAt: ["$$resultScore.studentResults", 0],
                },
              },
            },
          },
          second: {
            $map: {
              input: "$terms.second",
              as: "resultScore",
              in: {
                subject: { $arrayElemAt: ["$$resultScore.subject", 0] },
                studentResults: {
                  $arrayElemAt: ["$$resultScore.studentResults", 0],
                },
              },
            },
          },
          third: {
            $map: {
              input: "$terms.third",
              as: "resultScore",
              in: {
                subject: { $arrayElemAt: ["$$resultScore.subject", 0] },
                studentResults: {
                  $arrayElemAt: ["$$resultScore.studentResults", 0],
                },
              },
            },
          },
        },
      },
    },
    {
      $project: {
        name: 1,
        gender: 1,
        passport: 1,
        class: 1,
        arm: 1,
        admissionNumber: 1,
        present: 1,
        resultScores: {
          $map: {
            input: "$resultScores",
            as: "resultScore",
            in: {
              subject: "$$resultScore.subject.name",
              studentResults: {
                scores: "$$resultScore.studentResults.scores",
                total: "$$resultScore.studentResults.total",
                high: "$$resultScore.studentResults.high",
                low: "$$resultScore.studentResults.low",
                avg: "$$resultScore.studentResults.avg",
                position: "$$resultScore.studentResults.postion",
              },
            },
          },
        },
        terms: {
          first: {
            $map: {
              input: "$terms.first",
              as: "resultScore",
              in: {
                subject: "$$resultScore.subject.name",
                studentResults: {
                  scores: "$$resultScore.studentResults.scores",
                  total: "$$resultScore.studentResults.total",
                  high: "$$resultScore.studentResults.high",
                  low: "$$resultScore.studentResults.low",
                  avg: "$$resultScore.studentResults.avg",
                  position: "$$resultScore.studentResults.postion",
                },
              },
            },
          },
          second: {
            $map: {
              input: "$terms.second",
              as: "resultScore",
              in: {
                subject: "$$resultScore.subject.name",
                studentResults: {
                  scores: "$$resultScore.studentResults.scores",
                  total: "$$resultScore.studentResults.total",
                  high: "$$resultScore.studentResults.high",
                  low: "$$resultScore.studentResults.low",
                  avg: "$$resultScore.studentResults.avg",
                  position: "$$resultScore.studentResults.postion",
                },
              },
            },
          },
          third: {
            $map: {
              input: "$terms.third",
              as: "resultScore",
              in: {
                subject: "$$resultScore.subject.name",
                studentResults: {
                  scores: "$$resultScore.studentResults.scores",
                  total: "$$resultScore.studentResults.total",
                  high: "$$resultScore.studentResults.high",
                  low: "$$resultScore.studentResults.low",
                  avg: "$$resultScore.studentResults.avg",
                  position: "$$resultScore.studentResults.postion",
                },
              },
            },
          },
        },
      },
    },
    {
      $project: {
        name: 1,
        gender: 1,
        passport: 1,
        class: 1,
        arm: 1,
        admissionNumber: 1,
        present: 1,
        terms: 1,
        resultScores: 1,
        totalScore: {
          $reduce: {
            input: "$resultScores.studentResults.total",
            initialValue: 0,
            in: { $round: [{ $add: ["$$value", "$$this"] }, 1] },
          },
        },
        avg: {
          $reduce: {
            input: "$resultScores.studentResults.total",
            initialValue: 0,
            in: { $round: [{ $avg: ["$$value", "$$this"] }, 1] },
          },
        },
      },
    },
    {
      $project: {
        name: 1,
        gender: 1,
        passport: 1,
        class: 1,
        arm: 1,
        admissionNumber: 1,
        present: 1,
        terms: 1,
        resultScores: 1,
        totalScore: 1,
        avg: 1,
        cumulativeTotal: {
          $reduce: {
            input: {
              $concatArrays: [
                "$terms.first.studentResults.total",
                "$terms.second.studentResults.total",
                "$terms.third.studentResults.total",
              ],
            },
            initialValue: 0,
            in: { $round: [{ $add: ["$$value", "$$this"] }, 1] },
          },
        },
        cumulativeAvg: {
          $reduce: {
            input: {
              $concatArrays: [
                "$terms.first.studentResults.total",
                "$terms.second.studentResults.total",
                "$terms.third.studentResults.total",
              ],
            },
            initialValue: 0,
            in: { $round: [{ $avg: ["$$value", "$$this"] }, 1] },
          },
        },
      },
    },
    { $sort: { cumulativeTotal: -1 } },
    { $group: { _id: null, students: { $push: "$$ROOT" } } },
    { $unwind: { path: "$students", includeArrayIndex: "cumulativePostion" } },
    {
      $project: {
        students: 1,
        cumulativePostion: { $add: ["$cumulativePostion", 1] },
      },
    },
    { $project: { _id: 0 } },
    { $replaceRoot: { newRoot: { $mergeObjects: ["$students", "$$ROOT"] } } },
    { $project: { students: 0 } },
    { $sort: { totalScore: -1 } },
    { $group: { _id: null, students: { $push: "$$ROOT" } } },
    { $unwind: { path: "$students", includeArrayIndex: "position" } },
    { $project: { students: 1, position: { $add: ["$position", 1] } } },
    { $project: { _id: 0 } },
    { $replaceRoot: { newRoot: { $mergeObjects: ["$students", "$$ROOT"] } } },
    { $project: { students: 0 } },
    {
      $project: {
        name: 1,
        gender: 1,
        passport: 1,
        class: 1,
        arm: 1,
        admissionNumber: 1,
        present: 1,
        resultScores: 1,
        terms: 1,
        position: 1,
        totalScore: 1,
        avg: 1,
        cumulativeTotal: 1,
        cumulativeAvg: 1,
        cumulativePostion: 1,
      },
    },
    {
      $lookup: {
        from: "resultskills",
        localField: "_id",
        foreignField: "studentId",
        as: "resultSkills",
      },
    },
    {
      $lookup: {
        from: "resultbehaviours",
        localField: "_id",
        foreignField: "studentId",
        as: "resultBehaviours",
      },
    },
    {
      $project: {
        _id: 1,
        passport: 1,
        gender: 1,
        admissionNumber: 1,
        name: 1,
        class: 1,
        position: 1,
        present: 1,
        arm: 1,
        resultScores: 1,
        totalScore: 1,
        avg: 1,
        terms: 1,
        cumulativeTotal: 1,
        cumulativeAvg: 1,
        cumulativePostion: 1,
        resultBehaviours: {
          $filter: {
            input: "$resultBehaviours",
            as: "resultBehaviour",
            cond: {
              $and: [
                { $eq: ["$$resultBehaviour.term", term] },
                { $eq: ["$$resultBehaviour.section", section] },
              ],
            },
          },
        },
        resultSkills: {
          $filter: {
            input: "$resultSkills",
            as: "resultSkill",
            cond: {
              $and: [
                { $eq: ["$$resultSkill.term", term] },
                { $eq: ["$$resultSkill.section", section] },
              ],
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        passport: 1,
        gender: 1,
        admissionNumber: 1,
        position: 1,
        name: 1,
        class: 1,
        present: 1,
        arm: 1,
        resultScores: 1,
        totalScore: 1,
        avg: 1,
        terms: 1,
        cumulativeTotal: 1,
        cumulativeAvg: 1,
        cumulativePostion: 1,
        resultBehaviours: { $arrayElemAt: ["$resultBehaviours", 0] },
        resultSkills: { $arrayElemAt: ["$resultSkills", 0] },
      },
    },
    {
      $project: {
        _id: 1,
        passport: 1,
        gender: 1,
        admissionNumber: 1,
        position: 1,
        present: 1,
        name: 1,
        class: 1,
        arm: 1,
        resultScores: 1,
        totalScore: 1,
        avg: 1,
        terms: 1,
        cumulativeTotal: 1,
        cumulativeAvg: 1,
        cumulativePostion: 1,
        resultBehaviours: { behaviourScores: 1 },
        resultSkills: { skillScores: 1 },
      },
    },
    {
      $project: {
        _id: 1,
        passport: 1,
        gender: 1,
        admissionNumber: 1,
        position: 1,
        name: 1,
        class: 1,
        present: 1,
        arm: 1,
        resultScores: 1,
        totalScore: 1,
        avg: 1,
        terms: {
          first: {
            $map: {
              input: "$terms.first",
              as: "el",
              in: {
                subject: "$$el.subject",
                total: "$$el.studentResults.total",
              },
            },
          },
          second: {
            $map: {
              input: "$terms.second",
              as: "el",
              in: {
                subject: "$$el.subject",
                total: "$$el.studentResults.total",
              },
            },
          },
          third: {
            $map: {
              input: "$terms.third",
              as: "el",
              in: {
                subject: "$$el.subject",
                total: "$$el.studentResults.total",
              },
            },
          },
        },
        cumulativeTotal: 1,
        cumulativeAvg: 1,
        cumulativePostion: 1,
        resultBehaviours: "$resultBehaviours.behaviourScores",
        resultSkills: "$resultSkills.skillScores",
      },
    },
    {
      $project: {
        _id: 1,
        passport: 1,
        gender: 1,
        admissionNumber: 1,
        position: 1,
        name: 1,
        present: 1,
        class: 1,
        arm: 1,
        terms: 1,
        resultScores: {
          $map: {
            input: "$resultScores",
            as: "resultScore",
            in: {
              subject: "$$resultScore.subject",
              studentResults: "$$resultScore.studentResults",
              first: {
                $filter: {
                  input: "$terms.first",
                  as: "term",
                  cond: { $eq: ["$$term.subject", "$$resultScore.subject"] },
                },
              },
              second: {
                $filter: {
                  input: "$terms.second",
                  as: "term",
                  cond: { $eq: ["$$term.subject", "$$resultScore.subject"] },
                },
              },
              third: {
                $filter: {
                  input: "$terms.third",
                  as: "term",
                  cond: { $eq: ["$$term.subject", "$$resultScore.subject"] },
                },
              },
            },
          },
        },
        totalScore: 1,
        avg: 1,
        cumulativeTotal: 1,
        cumulativeAvg: 1,
        cumulativePostion: 1,
        resultBehaviours: 1,
        resultSkills: 1,
      },
    },
    {
      $project: {
        _id: 1,
        passport: 1,
        gender: 1,
        admissionNumber: 1,
        name: 1,
        position: 1,
        class: 1,
        present: 1,
        arm: 1,
        terms: 1,
        resultScores: {
          $map: {
            input: "$resultScores",
            as: "resultScore",
            in: {
              subject: "$$resultScore.subject",
              studentResults: "$$resultScore.studentResults",
              first: { $arrayElemAt: ["$$resultScore.first", 0] },
              second: { $arrayElemAt: ["$$resultScore.second", 0] },
              third: { $arrayElemAt: ["$$resultScore.third", 0] },
            },
          },
        },
        totalScore: 1,
        avg: 1,
        cumulativeTotal: 1,
        cumulativeAvg: 1,
        cumulativePostion: 1,
        resultBehaviours: 1,
        resultSkills: 1,
      },
    },
    {
      $project: {
        _id: 1,
        passport: 1,
        gender: 1,
        position: 1,
        admissionNumber: 1,
        name: 1,
        present: 1,
        class: 1,
        arm: 1,
        terms: 1,
        resultScores: {
          $map: {
            input: "$resultScores",
            as: "resultScore",
            in: {
              subject: "$$resultScore.subject",
              studentResults: "$$resultScore.studentResults",
              first: "$$resultScore.first.total",
              second: "$$resultScore.second.total",
              third: "$$resultScore.third.total",
            },
          },
        },
        totalScore: 1,
        avg: 1,
        cumulativeTotal: 1,
        cumulativeAvg: 1,
        cumulativePostion: 1,
        resultBehaviours: 1,
        resultSkills: 1,
      },
    },
    {
      $project: {
        _id: 1,
        passport: 1,
        gender: 1,
        position: 1,
        admissionNumber: 1,
        name: 1,
        class: 1,
        arm: 1,
        terms: 1,
        totalScore: 1,
        avg: 1,
        present: 1,
        cumulativeTotal: 1,
        cumulativeAvg: 1,
        cumulativePostion: 1,
        resultBehaviours: 1,
        resultSkills: 1,
        resultScores: {
          $filter: {
            input: "$resultScores",
            as: "beh",
            cond: {
              $ne: ["$$beh.studentResults", {}],
            },
          },
        },
      },
    },
  ];
};

const previousResultAggregate = (term, section, admissionNumber) => {
  return [
    {
      $lookup: {
        from: "classes",
        localField: "class",
        foreignField: "_id",
        as: "class",
      },
    },
    {
      $lookup: {
        from: "arms",
        localField: "arm",
        foreignField: "_id",
        as: "arm",
      },
    },
    {
      $lookup: {
        from: "subjects",
        localField: "subject",
        foreignField: "_id",
        as: "subject",
      },
    },
    {
      $project: {
        _id: 1,
        term: 1,
        section: 1,
        school: 1,
        studentResults: 1,
        class: { $arrayElemAt: ["$class", 0] },
        subject: { $arrayElemAt: ["$subject", 0] },
        arm: { $arrayElemAt: ["$arm", 0] },
      },
    },
    {
      $project: {
        _id: 1,
        term: 1,
        section: 1,
        school: 1,
        studentResults: 1,
        class: "$class.name",
        subject: "$subject.name",
        arm: "$arm.character",
      },
    },
    { $unwind: { path: "$studentResults" } },
    {
      $match: {
        "studentResults.admissionNumber": admissionNumber,
        term: term,
        section: section,
      },
    },
    {
      $lookup: {
        from: "resultskills",
        localField: "studentResults.admissionNumber",
        foreignField: "admissionNumber",
        as: "resultskills",
      },
    },
    {
      $lookup: {
        from: "resultbehaviours",
        localField: "studentResults.admissionNumber",
        foreignField: "admissionNumber",
        as: "resultbehaviours",
      },
    },
    {
      $project: {
        term: 1,
        section: 1,
        class: 1,
        arm: 1,
        subject: 1,
        studentResults: 1,
        resultbehaviours: {
          $filter: {
            input: "$resultbehaviours",
            as: "beh",
            cond: {
              $and: [
                { $eq: ["$$beh.term", term] },
                { $eq: ["$$beh.section", section] },
              ],
            },
          },
        },
        resultskills: {
          $filter: {
            input: "$resultskills",
            as: "beh",
            cond: {
              $and: [
                { $eq: ["$$beh.term", term] },
                { $eq: ["$$beh.section", section] },
              ],
            },
          },
        },
      },
    },
  ];
};
module.exports = {
  viewResultAggregate,
  previousResultAggregate,
  computeResult,
};
