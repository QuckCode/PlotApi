const _ = require("lodash");
const { APIError } = require("@errors/baseErrors");
import Student from "../Students/model";
const { missingImageError, missingParameterError } = require("../utils/error");
const mongoose = require("mongoose");
const Subject = require("../Subject/model");
const Class = require("../Class/model");
import Arm from "../Arm/model";
import School from "../School/model";
const ResultScore = require("./ResultScore");
const ResultBehaviour = require("./ResultBehaviour");
const ResultSkill = require("./ResultSkill");
const {
  viewResultAggregate,
  previousResultAggregate,
  computeResult,
} = require("./aggregate");
const { ObjectId } = mongoose.Types;

export const PerformResultComputation = async (req, res, next) => {
  const { classN, arm, school } = req.body;
  if (!classN)
    return next(
      new APIError("Missing Parameter", missingParameterError("Class"))
    );
  if (!arm)
    return next(
      new APIError("Missing Parameter", missingParameterError("Arm"))
    );
  if (!school)
    return next(
      new APIError("Missing Parameter", missingParameterError("School"))
    );

  School.findById(school)
    .then((school) => {
      ResultScore.find({
        class: classN,
        arm: arm,
        section: school.section,
        term: school.term,
      })
        .then((data) => {
          if (data.length === 0) {
            try {
              Student.aggregate(computeResult(classN, arm)).exec(
                (err, result) => {
                  console.log(err);
                  if (err) {
                    return next(new APIError("User Error", err.message));
                  }
                  if (result.length === 0)
                    return next(
                      new APIError("User Error", "No result was found")
                    );
                  let { term, section } = school;
                  let results = result.map((x) => {
                    return {
                      term,
                      section,
                      school: school._id,
                      ...x,
                      _id: new ObjectId(),
                    };
                  });

                  ResultScore.insertMany(results)
                    .then((data) => {
                      return res.send({ message: "Computation complete" });
                    })
                    .catch((error) =>
                      next(new APIError("User Error", error.message))
                    );
                }
              );
            } catch (error) {
              return next(new APIError("User Error", error.message));
            }
          } else {
            return next(
              new APIError("User Error", "Result have already bean computed")
            );
          }
        })
        .catch((error) => {
          return next(new APIError("User Error", error.message));
        });
    })
    .catch((error) => {
      return next(new APIError("User Error", error.message));
    });
};

export const PerformResultReComputation = async (req, res, next) => {
  const { classN, arm, school } = req.body;
  if (!classN)
    return next(
      new APIError("Missing Parameter", missingParameterError("Class"))
    );
  if (!arm)
    return next(
      new APIError("Missing Parameter", missingParameterError("Arm"))
    );
  if (!school)
    return next(
      new APIError("Missing Parameter", missingParameterError("School"))
    );

  School.findById(school)
    .then((school) => {
      ResultScore.deleteMany({
        class: classN,
        arm: arm,
        section: school.section,
        term: school.term,
      })
        .then(() => {
          PerformResultComputation(req, res, next);
        })
        .catch((err) => {
          return next(new APIError("User Error", err.message));
        });
    })
    .catch((error) => {
      return next(new APIError("User Error", error.message));
    });
};

export const PerformBehaviourResultComputation = async (req, res, next) => {
  const { classN, arm, school } = req.body;
  if (!classN)
    return next(
      new APIError("Missing Parameter", missingParameterError("Class"))
    );
  if (!arm)
    return next(
      new APIError("Missing Parameter", missingParameterError("Arm"))
    );
  if (!school)
    return next(
      new APIError("Missing Parameter", missingParameterError("School"))
    );

  School.findById(school)
    .then((school) => {
      ResultBehaviour.find({
        class: classN,
        arm: arm,
        section: school.section,
        term: school.term,
      })
        .then((data) => {
          if (data.length === 0) {
            try {
              Student.aggregate([
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
                {
                  $project: {
                    admissionNumber: 1,
                    name: {
                      $concat: [
                        "$firstName",
                        " ",
                        "$middleName",
                        " ",
                        "$srnName",
                      ],
                    },
                    passport: 1,
                    behaviourScores: 1,
                    class: { $arrayElemAt: ["$class", 0] },
                  },
                },
                {
                  $lookup: {
                    from: "sections",
                    localField: "class.section",
                    foreignField: "_id",
                    as: "section",
                  },
                },
                {
                  $project: {
                    admissionNumber: 1,
                    name: 1,
                    passport: 1,
                    behaviourScores: 1,
                    section: { $arrayElemAt: ["$section", 0] },
                  },
                },
                {
                  $project: {
                    behaviours: "$section.behaviors",
                    admissionNumber: 1,
                    name: 1,
                    passport: 1,
                    behaviourScores: 1,
                  },
                },
                {
                  $lookup: {
                    from: "behaviours",
                    localField: "behaviours",
                    foreignField: "_id",
                    as: "behaviours",
                  },
                },
                {
                  $project: {
                    behaviours: "$behaviours",
                    admissionNumber: 1,
                    name: 1,
                    passport: 1,
                    behaviourScores: {
                      $map: {
                        input: "$behaviourScores",
                        as: "score",
                        in: {
                          score: "$$score.score",
                          behaviour: {
                            $filter: {
                              input: "$behaviours",
                              as: "beh",
                              cond: { $eq: ["$$beh._id", "$$score.behaviour"] },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                {
                  $project: {
                    behaviours: "$behaviours",
                    admissionNumber: 1,
                    name: 1,
                    passport: 1,
                    behaviourScores: {
                      $map: {
                        input: "$behaviourScores",
                        as: "score",
                        in: {
                          score: "$$score.score",
                          behaviour: { $arrayElemAt: ["$$score.behaviour", 0] },
                        },
                      },
                    },
                  },
                },
                {
                  $project: {
                    behaviours: "$behaviours",
                    admissionNumber: 1,
                    name: 1,
                    passport: 1,
                    behaviourScores: {
                      $map: {
                        input: "$behaviourScores",
                        as: "score",
                        in: {
                          score: "$$score.score",
                          behaviour: "$$score.behaviour.name",
                          behaviourId: "$$score.behaviour._id",
                        },
                      },
                    },
                  },
                },
                {
                  $project: {
                    behaviourScores: 1,
                    admissionNumber: 1,
                    name: 1,
                    passport: 1,
                    behaviours: {
                      $map: {
                        input: "$behaviours",
                        as: "score",
                        in: "$$score._id",
                      },
                    },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    studentId: "$_id",
                    behaviourScores: 1,
                    admissionNumber: 1,
                    name: 1,
                    passport: 1,
                    behaviours: 1,
                  },
                },
              ]).exec((err, result) => {
                if (err) return next(new APIError("User Error", err.message));
                if (result.length === 0)
                  return next(
                    new APIError("User Error", "No Student was found")
                  );
                let { term, section } = school;
                let behaviourData = result.map((x) => {
                  return {
                    term,
                    section,
                    school: school._id,
                    class: classN,
                    arm,
                    behaviourScores: x.behaviourScores,
                    ...x,
                  };
                });
                ResultBehaviour.insertMany(behaviourData)
                  .then((x) => {
                    return res.send({ message: "Computation complete" });
                  })
                  .catch((error) => {
                    return next(new APIError("User Error", error.message));
                  });
              });
            } catch (error) {
              return next(new APIError("User Error", error.message));
            }
          } else {
            return next(
              new APIError(
                "User Error",
                "Result for behaviour have already bean computed"
              )
            );
          }
        })
        .catch((error) => {
          return next(new APIError("User Error", error.message));
        });
    })
    .catch((error) => {
      return next(new APIError("User Error", error.message));
    });
};

export const PerformBehaviourResultReComputation = async (req, res, next) => {
  const { classN, arm, school } = req.body;
  if (!classN)
    return next(
      new APIError("Missing Parameter", missingParameterError("Class"))
    );
  if (!arm)
    return next(
      new APIError("Missing Parameter", missingParameterError("Arm"))
    );
  if (!school)
    return next(
      new APIError("Missing Parameter", missingParameterError("School"))
    );

  School.findById(school)
    .then((school) => {
      ResultBehaviour.deleteMany({
        class: classN,
        arm: arm,
        section: school.section,
        term: school.term,
      })
        .then(() => {
          PerformBehaviourResultComputation(req, res, next);
        })
        .catch((err) => {
          return next(new APIError("User Error", err.message));
        });
    })
    .catch((error) => {
      return next(new APIError("User Error", error.message));
    });
};

export const PerformSkillResultComputation = async (req, res, next) => {
  const { classN, arm, school } = req.body;
  if (!classN)
    return next(
      new APIError("Missing Parameter", missingParameterError("Class"))
    );
  if (!arm)
    return next(
      new APIError("Missing Parameter", missingParameterError("Arm"))
    );
  if (!school)
    return next(
      new APIError("Missing Parameter", missingParameterError("School"))
    );

  School.findById(school)
    .then((school) => {
      ResultSkill.find({
        class: classN,
        arm: arm,
        section: school.section,
        term: school.term,
      })
        .then((data) => {
          if (data.length === 0) {
            try {
              Student.aggregate([
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
                {
                  $project: {
                    admissionNumber: 1,
                    name: {
                      $concat: [
                        "$firstName",
                        " ",
                        "$middleName",
                        " ",
                        "$srnName",
                      ],
                    },
                    passport: 1,
                    skillScores: 1,
                    class: { $arrayElemAt: ["$class", 0] },
                  },
                },
                {
                  $lookup: {
                    from: "sections",
                    localField: "class.section",
                    foreignField: "_id",
                    as: "section",
                  },
                },
                {
                  $project: {
                    admissionNumber: 1,
                    name: 1,
                    passport: 1,
                    skillScores: 1,
                    section: { $arrayElemAt: ["$section", 0] },
                  },
                },
                {
                  $project: {
                    skills: "$section.skills",
                    admissionNumber: 1,
                    name: 1,
                    passport: 1,
                    skillScores: 1,
                  },
                },
                {
                  $lookup: {
                    from: "skills",
                    localField: "skills",
                    foreignField: "_id",
                    as: "skills",
                  },
                },
                {
                  $project: {
                    skills: "$skills",
                    admissionNumber: 1,
                    name: 1,
                    passport: 1,
                    skillScores: {
                      $map: {
                        input: "$skillScores",
                        as: "score",
                        in: {
                          score: "$$score.score",
                          skill: {
                            $filter: {
                              input: "$skills",
                              as: "beh",
                              cond: { $eq: ["$$beh._id", "$$score.skill"] },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                {
                  $project: {
                    skills: "$skills",
                    admissionNumber: 1,
                    name: 1,
                    passport: 1,
                    skillScores: {
                      $map: {
                        input: "$skillScores",
                        as: "score",
                        in: {
                          score: "$$score.score",
                          skill: { $arrayElemAt: ["$$score.skill", 0] },
                        },
                      },
                    },
                  },
                },
                {
                  $project: {
                    skills: "$skills",
                    admissionNumber: 1,
                    name: 1,
                    passport: 1,
                    skillScores: {
                      $map: {
                        input: "$skillScores",
                        as: "score",
                        in: {
                          score: "$$score.score",
                          skill: "$$score.skill.name",
                          skillId: "$$score.skill._id",
                        },
                      },
                    },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    studentId: "$_id",
                    skillScores: 1,
                    admissionNumber: 1,
                    name: 1,
                    passport: 1,
                    skills: {
                      $map: {
                        input: "$skills",
                        as: "score",
                        in: "$$score._id",
                      },
                    },
                  },
                },
              ]).exec((err, result) => {
                if (err) return next(new APIError("User Error", err.message));
                if (result.length === 0)
                  return next(
                    new APIError("User Error", "No Student was found")
                  );
                let { term, section } = school;
                let behaviourData = result.map((x) => {
                  return {
                    term,
                    section,
                    school: school._id,
                    class: classN,
                    arm,
                    skillScores: x.skillScores,
                    ...x,
                  };
                });
                ResultSkill.insertMany(behaviourData)
                  .then((x) => {
                    return res.send({ message: "Computation complete" });
                  })
                  .catch((error) => {
                    return next(new APIError("User Error", error.message));
                  });
              });
            } catch (error) {
              return next(new APIError("User Error", error.message));
            }
          } else {
            return next(
              new APIError(
                "User Error",
                "Result for skill have already bean computed"
              )
            );
          }
        })
        .catch((error) => {
          return next(new APIError("User Error", error.message));
        });
    })
    .catch((error) => {
      return next(new APIError("User Error", error.message));
    });
};

export const PerformSkillResultReComputation = async (req, res, next) => {
  const { classN, arm, school } = req.body;
  if (!classN)
    return next(
      new APIError("Missing Parameter", missingParameterError("Class"))
    );
  if (!arm)
    return next(
      new APIError("Missing Parameter", missingParameterError("Arm"))
    );
  if (!school)
    return next(
      new APIError("Missing Parameter", missingParameterError("School"))
    );

  School.findById(school)
    .then((school) => {
      ResultSkill.deleteMany({
        class: classN,
        arm: arm,
        section: school.section,
        term: school.term,
      })
        .then(() => {
          PerformSkillResultComputation(req, res, next);
        })
        .catch((err) => {
          return next(new APIError("User Error", err.message));
        });
    })
    .catch((error) => {
      return next(new APIError("User Error", error.message));
    });
};

export const PrintResultForArm = async (req, res, next) => {
  const { classN, arm, school } = req.body;
  if (!classN)
    return next(
      new APIError("Missing Parameter", missingParameterError("Class"))
    );
  if (!arm)
    return next(
      new APIError("Missing Parameter", missingParameterError("Arm"))
    );
  if (!school)
    return next(
      new APIError("Missing Parameter", missingParameterError("School"))
    );

  Arm.findById(arm)
    .populate("classes")
    .exec()
    .then((armData) => {
      School.findById(school)
        .then(async (school) => {
          try {
            // console.log( armData.classes.name, armData.character)
            let resultSkill = await ResultSkill.find({
              class: classN,
              arm: arm,
              section: school.section,
              term: school.term,
            }).then((data) => data);
            let resultScore = await ResultScore.find({
              class: classN,
              arm: arm,
              section: school.section,
              term: school.term,
            }).then((data) => data);
            let resultBehaviour = await ResultBehaviour.find({
              class: classN,
              arm: arm,
              section: school.section,
              term: school.term,
            }).then((data) => data);
            if (resultSkill.length === 0)
              return next(
                "User  Error",
                "Please make sure you compute the skill score  for " +
                  armData.classes.name +
                  " " +
                  armData.character
              );
            if (resultScore.length === 0)
              return next(
                "User  Error",
                "Please make sure you compute the result  for " +
                  armData.classes.name +
                  " " +
                  armData.character
              );
            if (resultBehaviour.length === 0)
              return next(
                "User  Error",
                "Please make sure you compute the behaviour score  for " +
                  armData.classes.name +
                  " " +
                  armData.character
              );
            Student.aggregate(
              viewResultAggregate(school.term, school.section, arm, classN)
            ).exec((err, result) => {
              if (err) return next(new APIError("User Error", err.message));
              if (result.length === 0)
                return next(new APIError("User Error", "No Result was found"));
              return res.send(result);
            });
          } catch (error) {
            return next(new APIError("User Error", error.message));
          }
        })
        .catch((error) => {
          return next(new APIError("User Error", error.message));
        });
    })
    .catch((error) => {
      return next(new APIError("User Error", error.message));
    });
};

export const AddNotice = async (req, res, next) => {
  const { message, school } = req.body;

  if (!school)
    return next(
      new APIError("Missing Parameter", missingParameterError("School"))
    );
  if (!message)
    return next(
      new APIError("Missing Parameter", missingParameterError("Message"))
    );

  School.findById(school)
    .then((data) => {
      data.notice.push(message);
      data.save().then(() => {
        return res.send({ message: "Saved Notices" });
      });
    })
    .catch((error) => {
      return next(new APIError("User Error", error.message));
    });
};

export const RemoveNotice = async (req, res, next) => {
  const { message, school } = req.body;

  if (!school)
    return next(
      new APIError("Missing Parameter", missingParameterError("School"))
    );
  if (!message)
    return next(
      new APIError("Missing Parameter", missingParameterError("Message"))
    );

  School.findById(school)
    .then((data) => {
      data.notice.pop(message);
      data.save().then(() => {
        return res.send({ message: "Remove Notices" });
      });
    })
    .catch((error) => {
      return next(new APIError("User Error", error.message));
    });
};

export const GetAllNotice = async (req, res, next) => {
  const { school } = req.params;

  if (!school)
    return next(
      new APIError("Missing Parameter", missingParameterError("School"))
    );

  await School.findById(school)
    .then((data) => {
      return res.send(data.notice);
    })
    .catch((error) => {
      return next(new APIError("User Error", error.message));
    });
};

export const PromoteByResult = async (req, res, next) => {
  const { classN, arm, school, studentData } = req.body;

  if (!classN)
    return next(
      new APIError("Missing Parameter", missingParameterError("Class"))
    );
  if (!arm)
    return next(
      new APIError("Missing Parameter", missingParameterError("Arm"))
    );
  if (!school)
    return next(
      new APIError("Missing Parameter", missingParameterError("School"))
    );
  if (!studentData)
    return next(
      new APIError("Missing Parameter", missingParameterError("Students Date"))
    );

  for (let index = 0; index < studentData.length; index++) {
    const { _id, admissionNumber } = studentData[index];
    Student.findById(_id)
      .then((data) => {
        data.class = classN;
        data.arm = arm;
        (data.behaviourScores = []),
          (data.skillScores = []),
          (data.testScores = []);
        data.save().catch((err) => {
          return next(new APIError("User Error", err.message));
        });
      })
      .catch((err) => {
        return next(new APIError("User Error", err.message));
      });
  }
  return res.send({ message: "Successfully promoted student " });
};

export const GradateStudent = async (req, res, next) => {
  const { classN, arm, school, studentData } = req.body;

  if (!classN)
    return next(
      new APIError("Missing Parameter", missingParameterError("Class"))
    );
  if (!arm)
    return next(
      new APIError("Missing Parameter", missingParameterError("Arm"))
    );
  if (!school)
    return next(
      new APIError("Missing Parameter", missingParameterError("School"))
    );
  if (!studentData)
    return next(
      new APIError("Missing Parameter", missingParameterError("Students Date"))
    );

  for (let index = 0; index < studentData.length; index++) {
    const { _id, admissionNumber } = studentData[index];
    Student.findById(_id)
      .then((data) => {
        data.class = null;
        data.arm = null;
        (data.active = false),
          (data.behaviourScores = []),
          (data.skillScores = []),
          (data.testScores = []);
        data.save().catch((err) => {
          return next(new APIError("User Error", err.message));
        });
      })
      .catch((err) => {
        return next(new APIError("User Error", err.message));
      });
  }
  return res.send({ message: "Successfully graduated student " });
};

export const PreviousResult = async (req, res, next) => {
  const { term, section, admissionNumber } = req.body;
  console.log(req.body);
  if (!term)
    return next(
      new APIError("Missing Parameter", missingParameterError("Term"))
    );
  if (!section)
    return next(
      new APIError("Missing Parameter", missingParameterError("Section"))
    );
  if (!admissionNumber)
    return next(
      new APIError(
        "Missing Parameter",
        missingParameterError("Admission Number")
      )
    );

  try {
    ResultScore.aggregate(
      previousResultAggregate(term, section, admissionNumber)
    ).exec((err, result) => {
      if (err) return next(new APIError("User Error", err.message));
      if (result.length === 0)
        return next(new APIError("User Error", "No Result was found"));
      let resultBehaviour = result[0].resultbehaviours;
      let resultSkill = result[0].resultskills;
      let resultScore = result.map((x) => {
        return {
          subject: x.subject,
          class: x.class,
          arm: x.arm,
          scores: x.studentResults.scores,
          total: x.studentResults.total,
          position: x.studentResults.postion,
          high: x.studentResults.high,
          low: x.studentResults.low,
          avg: x.studentResults.avg,
        };
      });
      Student.find({ admissionNumber })
        .then((Student) => {
          return res.send({
            resultBehaviour,
            resultSkill,
            resultScore,
            Student,
          });
        })
        .catch((error) => {
          return next(new APIError("User Error", error.message));
        });
    });
  } catch (error) {
    return next(new APIError("User Error", error.message));
  }
};

export default {
  PerformResultComputation,
  PerformResultReComputation,
  PerformBehaviourResultComputation,
  PerformBehaviourResultReComputation,
  PerformSkillResultComputation,
  PerformSkillResultReComputation,
  PrintResultForArm,
  AddNotice,
  RemoveNotice,
  PromoteByResult,
  GetAllNotice,
  GradateStudent,
  PreviousResult,
};
