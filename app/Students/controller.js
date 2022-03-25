import { APIError } from "@errors/baseErrors";
import Student from "./model";
import { missingParameterError } from "../utils/error";
import jwt from "jsonwebtoken";
import config from "@config";
import utils from "../utils";
import Test from "../Tests/model";
import mongoose from "mongoose";
import Subject from "../Subject/model";
import Class from "../Class/model";
import moment from "moment";
import School from "../School/model";
const { ObjectId } = mongoose.Types;

export const createStudent = async (req, res, next) => {
  const {
    firstName,
    middleName,
    srnName,
    dob,
    gender,
    classN,
    arm,
    school,
    admissionDate,
    address,
    phone,
    state,
    lga,
  } = req.body;
  if (!firstName)
    return next(
      new APIError("Missing Parameter", missingParameterError("First Name"))
    );
  if (!srnName)
    return next(
      new APIError("Missing Parameter", missingParameterError("Last Name"))
    );
  if (!dob)
    return next(
      new APIError("Missing Parameter", missingParameterError("Date Of Birth"))
    );
  if (!gender)
    return next(
      new APIError("Missing Parameter", missingParameterError("Gender"))
    );
  if (!classN)
    return next(
      new APIError("Missing Parameter", missingParameterError("Class"))
    );
  if (!arm)
    return next(
      new APIError("Missing Parameter", missingParameterError("arm"))
    );
  if (!school)
    return next(
      new APIError("Missing Parameter", missingParameterError("School"))
    );
  if (!admissionDate)
    return next(
      new APIError("Missing Parameter", missingParameterError("School"))
    );
  var today = new Date();
  var year = today.getFullYear();

  try {
    const schoolData = await School.findOne({ _id: school });
    if (schoolData.length == 0)
      return next(new APIError("User Error", "School Was Not Found"));
    await Student.find({ school }).then((data) => {
      const student = new Student({
        class: classN,
        firstName,
        middleName,
        srnName,
        dob,
        phone,
        address,
        gender: gender === 1 ? true : false,
        classN,
        arm,
        school,
        admissionDate,
        admissionNumber: `${data.schoolPrefix}/student/${year}/${data.length}`,
        state,
        lga,
      });

      student
        .save()
        .then(() => res.send({ title: "Create Student ", message: "Success" }));
    });
  } catch (error) {
    return next(new APIError(error.title, error.message));
  }
};

export const editStudent = (req, res, next) => {
  const {
    admissionNumber,
    firstName,
    middleName,
    srnName,
    dob,
    gender,
    classN,
    arm,
    school,
    admissionDate,
    address,
    phone,
    state,
    lga,
  } = req.body;
  if (!admissionNumber)
    return next(
      new APIError(
        "Missing Parameter",
        missingParameterError("admission Number")
      )
    );
  if (!firstName)
    return next(
      new APIError("Missing Parameter", missingParameterError("First Name"))
    );
  if (!srnName)
    return next(
      new APIError("Missing Parameter", missingParameterError("Last Name"))
    );
  if (!dob)
    return next(
      new APIError("Missing Parameter", missingParameterError("Date Of Birth"))
    );
  if (!gender)
    return next(
      new APIError("Missing Parameter", missingParameterError("Gender"))
    );
  if (!classN)
    return next(
      new APIError("Missing Parameter", missingParameterError("Class"))
    );
  if (!arm)
    return next(
      new APIError("Missing Parameter", missingParameterError("arm"))
    );
  if (!school)
    return next(
      new APIError("Missing Parameter", missingParameterError("School"))
    );
  if (!admissionDate)
    return next(
      new APIError("Missing Parameter", missingParameterError("admission Date"))
    );
  var today = new Date();
  var year = today.getFullYear();

  Student.findOneAndUpdate(
    { admissionNumber: admissionNumber },
    {
      class: classN,
      firstName,
      middleName,
      srnName,
      dob,
      phone,
      address,
      gender: gender === 1 ? true : false,
      classN,
      arm,
      school,
      admissionDate,
      admissionNumber,
      state,
      lga,
    }
  )
    .then(() => {
      return res.send({
        title: "Edited Student ",
        message: "Edit was Successfully",
      });
    })
    .catch((err) => {
      console.log(err);
      return next(new APIError("User Error", "Please an error occurred"));
    });
};

export const fetchStudent = (req, res, next) => {
  const { school } = req.params;
  if (!school)
    return next(
      new APIError("Missing Parameter", missingParameterError("School"))
    );

  Student.find({ school })
    .select("-password")
    .populate("arm  class")
    .lean()
    .exec()
    .then((data) => {
      let students = data.map((x) => {
        if (x == null || x.class == null) return;
        return {
          admissionNumber: x.admissionNumber,
          id: x._id,
          name: `${x.firstName} ${
            x.middleName == undefined ? "" : x.middleName
          } ${x.srnName}`,
          gender: x.gender,
          class: x.class.name,
          dob: x.dob,
          arm: x.arm.character,
          passport: x.passport,
          address: x.address,
          state: x.state,
          phone: x.phone,
        };
      });

      let newStudentList = students.filter((el) => el != undefined);
      return res.send(newStudentList);
    })
    .catch((err) => {
      console.log(err);
      return next(new APIError("User Error", "please an error occurred"));
    });
};

export const deleteStudent = async (req, res, next) => {
  const { id } = req.params;
  try {
    let data = await Student.findByIdAndRemove(id);
    return res.status(200).send({
      title: "Deleted Student ",
      message: "Delete was Successfully",
    });
  } catch (error) {
    return next(new APIError("User Error", "Please an error occurred"));
  }
};

export const login = function (passport) {
  return function (req, res, next) {
    passport.authenticate(
      "student",
      { session: false },
      (err, student, info) => {
        if (err || !student)
          return next(new APIError("User Error", info.message, 400));

        req.login(student, { session: false }, (err) => {
          if (err) {
            next(err);
          }
          student = student._doc;
          delete student.password;
          student.userType = "student";

          // Provide data since user is not a proper serialized object
          const token = jwt.sign(
            { ...student, exp: moment().add(1, "days").valueOf() },
            config.SECRET
          );
          return res.json({
            success: true,
            token,
          });
        });
      }
    )(req, res);
  };
};

export const addSingleStudentBehaviourScore = (req, res, next) => {
  const { studentId, score, behaviourId } = req.body;
  if (!studentId)
    return next(
      new APIError("Missing Parameter", missingParameterError("Student "))
    );
  if (!behaviourId)
    return next(
      new APIError("Missing Parameter", missingParameterError("Behaviour "))
    );
  if (!score)
    return next(
      new APIError("Missing Parameter", missingParameterError("Score"))
    );
  Student.findById(studentId)
    .select("-password")
    .populate({
      path: "class",
      model: "Class",
      select: "section",
      populate: { path: "section", model: "Sections", select: "behaviors" },
    })
    .populate("behaviourScores", "behaviour -_id")
    .then((stu) => {
      if (!stu.class.section.behaviors.includes(behaviourId))
        return next(
          new APIError(
            "User error",
            "Student section does not have this behaviour"
          )
        );
      stu.behaviourScores.push({
        behaviour: behaviourId,
        score,
        class: stu.class._id,
      });
      stu.save();
      return res.send({ message: "Successfully saved" });
    })
    .catch((err) => {
      console.log(err);
      return next(new APIError("User error", "Could not find student"));
    });
};

export const addSingleStudentSkillScore = (req, res, next) => {
  const { studentId, score, skillId } = req.body;
  console.log(studentId, skillId);
  if (!studentId)
    return next(
      new APIError("Missing Parameter", missingParameterError("Student "))
    );
  if (!skillId)
    return next(
      new APIError("Missing Parameter", missingParameterError("Skill"))
    );
  if (!score)
    return next(
      new APIError("Missing Parameter", missingParameterError("Score"))
    );
  Student.findById(studentId)
    .select("-password")
    .populate({
      path: "class",
      model: "Class",
      select: "section",
      populate: { path: "section", model: "Sections", select: "skills" },
    })
    .then((stu) => {
      if (!stu.class.section.skills.includes(skillId))
        return next(
          new APIError("User error", "Student section does not have this skill")
        );
      stu.skillsScores.push({ skill: skillId, score, class: stu.class._id });
      stu.save();
      return res.send({ message: "Successfully saved" });
    })
    .catch((err) => {
      console.log(err);
      return next(new APIError("User error", "Could not find student"));
    });
};

export const addSingleStudentTestScore = (req, res, next) => {
  const { studentId, score, testId, subjectId } = req.body;
  console.log(studentId, testId);
  if (!studentId)
    return next(
      new APIError("Missing Parameter", missingParameterError("Student "))
    );
  if (!testId)
    return next(
      new APIError("Missing Parameter", missingParameterError("Test"))
    );
  if (!score)
    return next(
      new APIError("Missing Parameter", missingParameterError("Score"))
    );
  if (!subjectId)
    return next(
      new APIError("Missing Parameter", missingParameterError("Subject"))
    );
  Student.findById(studentId)
    .select("-password")
    .populate("class", "tests")
    .then((stu) => {
      if (!stu.class.tests.includes(testId))
        return next(
          new APIError("User error", "Student Class does not have this test")
        );
      stu.testScores.push({
        test: testId,
        score,
        class: stu.class._id,
        subjectId: subjectId,
      });
      stu.save();
      return res.send({ message: "Successfully saved" });
    })
    .catch((err) => {
      console.log(err);
      return next(new APIError("User error", "Could not find student"));
    });
};

export const getStudentAllSubjectAndScore = (req, res, next) => {
  const { studentId, testId } = req.params;
  if (!studentId)
    return next(
      new APIError("Missing Parameter", missingParameterError("Student "))
    );
  Student.findById(studentId)
    .populate({
      path: "class",
      select: "subjects",
      populate: { path: "subjects", model: "Subject", select: "name _id" },
    })
    .populate({
      path: "class",
      select: "tests",
      populate: { path: "tests", model: "Test", select: "name  _id" },
    })
    .lean()
    .exec()
    .then((data) => {
      let tests = data.class.tests.map((test) => {
        return { ...test, score: 0, hasScore: false };
      });
      let subjects = data.class.subjects.map((subject) => subject);
      let testScores = data.testScores.map((score) => score);
      let testAndScore = subjects.map((x) => {
        x.tests = tests;
        return x;
      });

      return res.send(utils.parseStudentScoreList(testScores, testAndScore));
    })
    .catch((err) => {
      return next(new APIError("User Error", err.message));
    });
};

export const getArmStudentSubjectScore = (req, res, next) => {
  const { classId, armId, testId, subjectId, subjectName } = req.body;
  if (!classId)
    return next(
      new APIError("Missing Parameter", missingParameterError("Class"))
    );
  if (!testId)
    return next(
      new APIError("Missing Parameter", missingParameterError("Test"))
    );
  if (!armId)
    return next(
      new APIError("Missing Parameter", missingParameterError("Arm"))
    );
  if (!subjectId)
    return next(
      new APIError("Missing Parameter", missingParameterError("SubjectId"))
    );
  if (!subjectName)
    return next(
      new APIError("Missing Parameter", missingParameterError("Subject Name"))
    );

  Class.findById(classId)
    .populate("subjects")
    .then((data) => {
      let subject = data.subjects.find(
        (x) => String(x._id) === String(subjectId)
      );
      if (subject) {
        Student.find({
          class: mongoose.Types.ObjectId(classId),
          arm: mongoose.Types.ObjectId(armId),
        })
          .select("-password")
          .lean()
          .exec()
          .then((studentData) => {
            if (studentData.length == 0)
              return next(new APIError("User Error", "No Student was Found"));
            Test.findById(testId)
              .lean()
              .exec()
              .then((test) => {
                if (!test)
                  return next(new APIError("User Error", "No Test was Found"));
                Subject.findById(subjectId)
                  .lean()
                  .exec()
                  .then((subject) => {
                    if (!subject)
                      return next(
                        new APIError("User Error", "No Subject was Found")
                      );
                    return res.send({
                      subject,
                      test,
                      students: utils.parseStudentArmSubject(
                        subject,
                        test,
                        studentData
                      ),
                    });
                  })
                  .catch((err) => {
                    console.log(err);
                    return next(new APIError("User Error", err.message));
                  });
              })
              .catch((err) => {
                console.log(err);
                return next(new APIError("User Error", err.message));
              });
          })
          .catch(() =>
            next(new APIError("User Error", "Please an error occurred"))
          );
      } else
        return next(
          new APIError(
            "User Error",
            `${subjectName} is not added to  ${data.name} Class`
          )
        );
    })
    .catch((err) => next(new APIError("User Error", err.message)));
};

export const getAllArmStudentAndSubject = (req, res, next) => {
  const { classId, armId, testId } = req.body;
  if (!classId)
    return next(
      new APIError("Missing Parameter", missingParameterError("Class"))
    );
  if (!testId)
    return next(
      new APIError("Missing Parameter", missingParameterError("Test"))
    );
  if (!armId)
    return next(
      new APIError("Missing Parameter", missingParameterError("Arm"))
    );

  Student.find({
    class: mongoose.Types.ObjectId(classId),
    arm: mongoose.Types.ObjectId(armId),
  })
    .select("-password")
    .populate({
      path: "class",
      select: "subjects",
      populate: { path: "subjects", select: "name " },
    })
    .lean()
    .exec()
    .then((studentData) => {
      if (studentData.length == 0)
        return next(new APIError("User Error", "No Student was Found"));
      Test.findById(testId).then((test) => {
        if (test.length == 0)
          return next(new APIError("User Error", "No Test was Found"));
        return res.send(utils.parseAllArmStudentTest(studentData, test));
      });
    })
    .catch(() => {
      return next(new APIError("User Error", "Please an error occurred"));
    });
};

export const saveStudentScoreBySubject = (req, res, next) => {
  const { test, subject, students } = req.body;
  if (!test)
    return next(
      new APIError("Missing Parameter", missingParameterError("Test "))
    );
  if (!subject)
    return next(
      new APIError("Missing Parameter", missingParameterError("Subject "))
    );
  if (!students)
    return next(
      new APIError("Missing Parameter", missingParameterError("Students List"))
    );
  let x = students.map((x) => {
    return {
      userId: x.userId,
      score: x.score,
      subject: subject._id,
      test: test._id,
      admissionNumber: x.admissionNumber,
    };
  });
  for (const student of x) {
    Student.findOne({ _id: mongoose.Types.ObjectId(student.userId) })
      .then((x) => {
        if (x.testScores.length > 0) {
          Student.findOne({
            _id: mongoose.Types.ObjectId(student.userId),
          }).then((update) => {
            let testScoreIndex = update.testScores.findIndex(
              (d) =>
                String(d.class) === String(x.class) &&
                String(student.test) === String(d.test) &&
                String(student.subject) === String(d.subject)
            );
            if (update.testScores[testScoreIndex] === undefined) {
              update.testScores.push({
                test: student.test,
                score: student.score,
                subject: student.subject,
                class: x.class,
              });
              return update.save();
            }
            update.testScores[testScoreIndex].score = student.score;
            return update.save();
          });
          return;
        }

        x.testScores.push({
          test: student.test,
          score: student.score,
          subject: student.subject,
          class: x.class,
        });
        return x.save();
      })
      .catch((err) => {
        console.log(err);
        return next(new APIError("User Error", err.message));
      });
  }

  return res.send({ message: "Saved user Score" });
};

export const saveStudentScore = (req, res, next) => {
  const { student } = req.body;
  for (const score of student.studentTestScore) {
    Student.findOne({ _id: mongoose.Types.ObjectId(student.userId) })
      .then((x) => {
        if (x.testScores.length > 0) {
          Student.findOne({
            _id: mongoose.Types.ObjectId(student.userId),
            "testScores.test": mongoose.Types.ObjectId(score.test),
            "testScores.subject": mongoose.Types.ObjectId(score.subjectId),
            "testScores.class": mongoose.Types.ObjectId(x.class),
          }).then((update) => {
            let testScoreIndex = update.testScores.findIndex(
              (d) =>
                String(d.class) === String(x.class) &&
                String(score.test) === String(d.test) &&
                String(score.subjectId) === String(d.subject)
            );
            if (update.testScores[testScoreIndex] === undefined) {
              update.testScores.push({
                test: score.test,
                score: score.score,
                subject: score.subjectId,
                class: x.class,
              });
              return update.save();
            }
            update.testScores[testScoreIndex].score = score.score;
            return update.save();
          });
          return;
        }
        x.testScores.push({
          test: score.test,
          score: score.score,
          subject: score.subjectId,
          class: x.class,
        });
        return x.save();
      })
      .catch((err) => {
        return next(new APIError("User Error", err.message));
      });
  }
  return res.send({ message: "Saved user Score" });
};

export const getStudentBehaviourScore = (req, res, next) => {
  const { armId, classId } = req.body;
  if (!armId)
    return next(
      new APIError("Missing Parameter", missingParameterError("Arm"))
    );
  if (!classId)
    return next(
      new APIError("Missing Parameter", missingParameterError("Class"))
    );

  try {
    Student.aggregate([
      {
        $match: {
          class: new mongoose.Types.ObjectId(classId),
          arm: new mongoose.Types.ObjectId(armId),
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
          passport: 1,
          admissionNumber: 1,
          name: {
            $concat: ["$firstName", " ", "$middleName", " ", "$srnName"],
          },
          class: { $arrayElemAt: ["$class", 0] },
          skillScores: 1,
          behaviourScores: 1,
        },
      },
      {
        $lookup: {
          from: "sections",
          localField: "class.section",
          foreignField: "_id",
          as: "class.section",
        },
      },
      {
        $project: {
          passport: 1,
          admissionNumber: 1,
          name: 1,
          section: { $arrayElemAt: ["$class.section", 0] },
          skillScores: 1,
          behaviourScores: 1,
          class: 1,
        },
      },
      {
        $lookup: {
          from: "behaviours",
          localField: "section.behaviors",
          foreignField: "_id",
          as: "behaviours",
        },
      },
      {
        $lookup: {
          from: "skills",
          localField: "section.skills",
          foreignField: "_id",
          as: "skills",
        },
      },
    ]).exec((err, result) => {
      if (err) {
        console.log(err);
        return next(new APIError("User Error", err.message));
      }

      if (result.length === 0)
        return next(new APIError("User Error", "No Student was found"));
      return res.send(utils.parseBehaviourScoreByStudent(result, next));
    });
  } catch (error) {
    return next(new APIError("User Error", error.message));
  }
};

export const saveStudentBehaviourScore = (req, res, next) => {
  const { userId, behaviours } = req.body;
  if (!userId)
    return next(
      new APIError("Missing Parameter", missingParameterError("Arm"))
    );
  if (!behaviours)
    return next(
      new APIError("Missing Parameter", missingParameterError("Class"))
    );
  if (!behaviours.length > 0)
    return next(
      new APIError(
        "Invalid Property ",
        "Please the number of behaviors can not be empty"
      )
    );

  Student.findById(userId)
    .then(async (x) => {
      if (x.behaviourScores.length == 0) {
        await behaviours.map((y) => {
          x.behaviourScores.push({
            class: x.class,
            score: y.score,
            behaviour: y._id,
          });
        });
        await x
          .save()
          .then((x) => res.send({ message: "Save user behaviours" }))
          .catch((err) => next(new APIError("User Error", err.message)));
      } else {
        for (const behaviour of behaviours) {
          Student.findOne({
            _id: mongoose.Types.ObjectId(userId),
            "behaviourScores.behaviour": mongoose.Types.ObjectId(behaviour._id),
            "behaviourScores.class": mongoose.Types.ObjectId(x.class),
          })
            .then((b) => {
              let index = b.behaviourScores.findIndex(
                (d) =>
                  String(d.behaviour) === behaviour._id &&
                  String(d.class) === String(x.class)
              );
              if (index === -1) return;
              else {
                b.behaviourScores[index].score = behaviour.score;
                b.save();
              }
            })
            .catch((err) => next(new APIError("User Error", err.message)));
        }
        return res.send({ message: "Save score" });
      }
    })
    .catch((err) => {
      return next(new APIError("User Error", err.message));
    });
};

export const getStudentSkillScore = (req, res, next) => {
  const { armId, classId } = req.body;
  if (!armId)
    return next(
      new APIError("Missing Parameter", missingParameterError("Arm"))
    );
  if (!classId)
    return next(
      new APIError("Missing Parameter", missingParameterError("Class"))
    );

  try {
    Student.aggregate([
      {
        $match: {
          class: new mongoose.Types.ObjectId(classId),
          arm: new mongoose.Types.ObjectId(armId),
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
          passport: 1,
          admissionNumber: 1,
          name: {
            $concat: ["$firstName", " ", "$middleName", " ", "$srnName"],
          },
          class: { $arrayElemAt: ["$class", 0] },
          skillScores: 1,
          behaviourScores: 1,
        },
      },
      {
        $lookup: {
          from: "sections",
          localField: "class.section",
          foreignField: "_id",
          as: "class.section",
        },
      },
      {
        $project: {
          passport: 1,
          admissionNumber: 1,
          name: 1,
          section: { $arrayElemAt: ["$class.section", 0] },
          skillScores: 1,
          behaviourScores: 1,
          class: 1,
        },
      },
      {
        $lookup: {
          from: "behaviours",
          localField: "section.behaviors",
          foreignField: "_id",
          as: "behaviours",
        },
      },
      {
        $lookup: {
          from: "skills",
          localField: "section.skills",
          foreignField: "_id",
          as: "skills",
        },
      },
    ]).exec((err, result) => {
      if (err) {
        console.log(err);
        return next(new APIError("User Error", err.message));
      }
      if (result.length === 0)
        return next(new APIError("User Error", "No Student was found"));
      return res.send(utils.parseSkillScoreByStudent(result, next));
    });
  } catch (error) {
    return next(new APIError("User Error", error.message));
  }
};

export const saveStudentSkillScore = (req, res, next) => {
  const { userId, skills } = req.body;
  if (!userId)
    return next(
      new APIError("Missing Parameter", missingParameterError("User"))
    );
  if (!skills)
    return next(
      new APIError("Missing Parameter", missingParameterError("Class"))
    );
  if (!skills.length > 0)
    return next(
      new APIError(
        "Invalid Property Skill ",
        "Please the number of skills can not be empty"
      )
    );

  Student.findById(userId)
    .then(async (x) => {
      if (x.skillScores.length == 0) {
        await skills.map((y) => {
          x.skillScores.push({ class: x.class, score: y.score, skill: y._id });
        });
        await x
          .save()
          .then((x) => res.send({ message: "Save user skills" }))
          .catch((err) => next(new APIError("User Error", err.message)));
      } else {
        for (const skill of skills) {
          Student.findOne({
            _id: mongoose.Types.ObjectId(userId),
            "skillScores.skill": mongoose.Types.ObjectId(skill._id),
            "skillScores.class": mongoose.Types.ObjectId(x.class),
          })
            .then((b) => {
              let index = b.skillScores.findIndex(
                (d) =>
                  String(d.skill) === skill._id &&
                  String(d.class) === String(x.class)
              );
              if (index === -1) {
                return;
              } else {
                b.skillScores[index].score = skill.score;
                b.save();
              }
            })
            .catch((err) => next(new APIError("User Error", err.message)));
        }
        return res.send({ message: "Save score" });
      }
    })
    .catch((err) => {
      return next(new APIError("User Error", err.message));
    });
};

export const fixDatabase = () => {
  Student.find({}).then((data) => {
    for (let index = 0; index < data.length; index++) {
      data[index].behaviourScores = [];
      data[index].save();
    }
  });
};

export const getGraphForTotalStudentInAClass = (req, res, next) => {
  const { school } = req.params;
  if (!school)
    return next(
      new APIError("Missing Parameter", missingParameterError("School"))
    );
  try {
    Class.aggregate([
      { $match: { school: new mongoose.Types.ObjectId(school) } },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "class",
          as: "students",
        },
      },
      {
        $project: {
          x: "$name",
          y: {
            $cond: {
              if: { $isArray: "$students" },
              then: { $size: "$students" },
              else: [],
            },
          },
        },
      },
    ]).exec((err, result) => {
      if (err) {
        console.log(err);
        return next(new APIError("User Error", err.message));
      }
      //     if(result.length===0) return next( new APIError("User Error","No Student was found"))
      return res.send(result.filter((x) => x.y !== 0));
    });
  } catch (error) {
    return next(new APIError("User Error", error.message));
  }
};

export const validateScoreBySubject = (req, res, next) => {
  const { classN, arm, subject } = req.params;
  if (!classN)
    return next(
      new APIError("Missing Parameter", missingParameterError("Class"))
    );
  if (!arm)
    return next(
      new APIError("Missing Parameter", missingParameterError("Arm"))
    );
  if (!subject)
    return next(
      new APIError("Missing Parameter", missingParameterError("Subject"))
    );

  try {
    Student.aggregate([
      { $match: { class: new ObjectId(classN), arm: new ObjectId(arm) } },
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
          testScores: 1,
          firstName: 1,
          middleName: 1,
          srnName: 1,
          passport: 1,
          class: { _id: 1, name: 1 },
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
          passport: 1,
          subjects: "$subjects",
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
          srnName: 1,
          middleName: 1,
          class: 1,
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
      { $match: { _id: new ObjectId(subject) } },
      { $sort: { "scoresAndStudent.score.test.name": 1 } },
      {
        $project: {
          scoresAndStudent: {
            $map: {
              input: "$scoresAndStudent",
              as: "scoreStu",
              in: {
                name: "$$scoreStu.name",
                admissionNumber: "$$scoreStu.admissionNumber",
                score: {
                  $map: {
                    input: "$$scoreStu.score",
                    as: "score",
                    in: {
                      score: "$$score.score",
                      subject: "$$score.subject.name",
                      test: "$$score.test.name",
                    },
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
            $map: {
              input: "$scoresAndStudent",
              as: "scoreStu",
              in: {
                name: "$$scoreStu.name",
                admissionNumber: "$$scoreStu.admissionNumber",
                score: {
                  $concatArrays: [
                    "$$scoreStu.score",
                    [{ test: "Total", score: "$$scoreStu.total.score" }],
                  ],
                },
              },
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
                admissionNumber: "$$scoreStu.admissionNumber",
                score: {
                  $arrayToObject: {
                    $map: {
                      input: "$$scoreStu.score",
                      as: "el",
                      in: { k: "$$el.test", v: "$$el.score" },
                    },
                  },
                },
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
        return next(new APIError("User Error", "No result was found"));
      //  return  res.send(result[0].scoresAndStudent)
      return res.send(
        result[0].scoresAndStudent.map((x) => {
          return {
            name: x.name,
            admissionNumber: x.admissionNumber,
            ...x.score,
          };
        })
      );
    });
  } catch (error) {
    return next(new APIError("User Error", error.message));
  }
};

export const getStudentByAdmissionNumber = (req, res, next) => {
  const { admissionNumber } = req.params;
  if (!admissionNumber)
    return next(
      new APIError(
        "Missing Parameter",
        missingParameterError("Admission  Number")
      )
    );
  let newStudent = admissionNumber.replace(/-/gi, "/");
  console.log(newStudent);
  Student.findOne({ admissionNumber: newStudent })
    .select("-behaviourScores -skillScores -testScores -password")
    .then((data) => {
      return res.send(data);
    })
    .catch((err) => {
      return next(new APIError("User Error", err.message));
    });
};

export const ValidateResultScoreByArm = (req, res, next) => {
  const { classN, arm } = req.params;
  if (!classN)
    return next(
      new APIError("Missing Parameter", missingParameterError("Class"))
    );
  if (!arm)
    return next(
      new APIError("Missing Parameter", missingParameterError("Arm"))
    );

  try {
    Student.aggregate([
      { $match: { class: new ObjectId(classN), arm: new ObjectId(arm) } },
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
          testScores: 1,
          firstName: 1,
          middleName: 1,
          srnName: 1,
          passport: 1,
          class: { _id: 1, name: 1 },
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
          passport: 1,
          subjects: "$subjects",
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
          srnName: 1,
          middleName: 1,
          class: 1,
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
      { $sort: { "scoresAndStudent.score.test.name": 1 } },
      {
        $project: {
          scoresAndStudent: {
            $map: {
              input: "$scoresAndStudent",
              as: "scoreStu",
              in: {
                name: "$$scoreStu.name",
                admissionNumber: "$$scoreStu.admissionNumber",
                score: {
                  $map: {
                    input: "$$scoreStu.score",
                    as: "score",
                    in: {
                      score: "$$score.score",
                      subject: "$$score.subject.name",
                      test: "$$score.test.name",
                    },
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
      { $unwind: { path: "$scoresAndStudent" } },
      { $sort: { "scoresAndStudent.total.score": -1 } },
      { $group: { _id: "$_id", scoresAndStudent: { $push: "$$ROOT" } } },
      { $unwind: { path: "$scoresAndStudent", includeArrayIndex: "postion" } },
      {
        $project: {
          scoresAndStudent: {
            name: "$scoresAndStudent.scoresAndStudent.name",
            admissionNumber:
              "$scoresAndStudent.scoresAndStudent.admissionNumber",
            scores: "$scoresAndStudent.scoresAndStudent.score",
            total: "$scoresAndStudent.scoresAndStudent.total",
            postion: { $add: ["$postion", 1] },
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          scoresAndStudent: { $push: "$scoresAndStudent" },
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
                admissionNumber: "$$scoreStu.admissionNumber",
                postion: "$$scoreStu.postion",
                score: {
                  $concatArrays: [
                    "$$scoreStu.scores",
                    [{ test: "Total", score: "$$scoreStu.total.score" }],
                  ],
                },
              },
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
                admissionNumber: "$$scoreStu.admissionNumber",
                postion: "$$scoreStu.postion",
                score: {
                  $arrayToObject: {
                    $map: {
                      input: "$$scoreStu.score",
                      as: "el",
                      in: { k: "$$el.test", v: "$$el.score" },
                    },
                  },
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
          scoresAndStudent: "$scoresAndStudent",
          subject: { $arrayElemAt: ["$subject", 0] },
        },
      },
    ]).exec((err, result) => {
      if (err) {
        console.log(err);
        return next(new APIError("User Error", err.message));
      }
      if (result.length === 0)
        return next(new APIError("User Error", "No result was found"));
      return res.send(
        result.map((x) => {
          let studentData = x.scoresAndStudent.map((y) => {
            return {
              name: y.name,
              admissionNumber: y.admissionNumber,
              ...y.score,
              postion: y.postion,
            };
          });
          return { studentData: studentData, subject: x.subject };
        })
      );
    });
  } catch (error) {
    return next(new APIError("User Error", error.message));
  }
};

export const ValidateResultScoreByClass = (req, res, next) => {
  const { classN } = req.params;
  if (!classN)
    return next(
      new APIError("Missing Parameter", missingParameterError("Class"))
    );

  try {
    Student.aggregate([
      { $match: { class: new ObjectId(classN) } },
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
          testScores: 1,
          firstName: 1,
          middleName: 1,
          srnName: 1,
          passport: 1,
          class: { _id: 1, name: 1 },
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
          passport: 1,
          subjects: "$subjects",
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
          srnName: 1,
          middleName: 1,
          class: 1,
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
      { $sort: { "scoresAndStudent.score.test.name": 1 } },
      {
        $project: {
          scoresAndStudent: {
            $map: {
              input: "$scoresAndStudent",
              as: "scoreStu",
              in: {
                name: "$$scoreStu.name",
                admissionNumber: "$$scoreStu.admissionNumber",
                score: {
                  $map: {
                    input: "$$scoreStu.score",
                    as: "score",
                    in: {
                      score: "$$score.score",
                      subject: "$$score.subject.name",
                      test: "$$score.test.name",
                    },
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
      { $unwind: { path: "$scoresAndStudent" } },
      { $sort: { "scoresAndStudent.total.score": -1 } },
      { $group: { _id: "$_id", scoresAndStudent: { $push: "$$ROOT" } } },
      { $unwind: { path: "$scoresAndStudent", includeArrayIndex: "postion" } },
      {
        $project: {
          scoresAndStudent: {
            name: "$scoresAndStudent.scoresAndStudent.name",
            admissionNumber:
              "$scoresAndStudent.scoresAndStudent.admissionNumber",
            scores: "$scoresAndStudent.scoresAndStudent.score",
            total: "$scoresAndStudent.scoresAndStudent.total",
            postion: { $add: ["$postion", 1] },
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          scoresAndStudent: { $push: "$scoresAndStudent" },
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
                admissionNumber: "$$scoreStu.admissionNumber",
                postion: "$$scoreStu.postion",
                score: {
                  $concatArrays: [
                    "$$scoreStu.scores",
                    [{ test: "Total", score: "$$scoreStu.total.score" }],
                  ],
                },
              },
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
                admissionNumber: "$$scoreStu.admissionNumber",
                postion: "$$scoreStu.postion",
                score: {
                  $arrayToObject: {
                    $map: {
                      input: "$$scoreStu.score",
                      as: "el",
                      in: { k: "$$el.test", v: "$$el.score" },
                    },
                  },
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
          scoresAndStudent: "$scoresAndStudent",
          subject: { $arrayElemAt: ["$subject", 0] },
        },
      },
    ]).exec((err, result) => {
      if (err) {
        console.log(err);
        return next(new APIError("User Error", err.message));
      }
      if (result.length === 0)
        return next(new APIError("User Error", "No result was found"));
      return res.send(
        result.map((x) => {
          let studentData = x.scoresAndStudent.map((y) => {
            return {
              name: y.name,
              admissionNumber: y.admissionNumber,
              ...y.score,
              postion: y.postion,
            };
          });
          return { studentData: studentData, subject: x.subject };
        })
      );
    });
  } catch (error) {
    return next(new APIError("User Error", error.message));
  }
};

export const GetResultComputation = (req, res, next) => {
  const { classN, arm } = req.params;
  if (!classN)
    return next(
      new APIError("Missing Parameter", missingParameterError("Class"))
    );
  if (!arm)
    return next(
      new APIError("Missing Parameter", missingParameterError("Arm"))
    );

  try {
    Student.aggregate([
      { $match: { class: new ObjectId(classN), arm: new ObjectId(arm) } },
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
          testScores: 1,
          firstName: 1,
          middleName: 1,
          srnName: 1,
          passport: 1,
          class: { _id: 1, name: 1 },
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
          passport: 1,
          subjects: "$subjects",
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
          srnName: 1,
          middleName: 1,
          class: 1,
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
              class: "$class._id",
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
                admissionNumber: "$$scoreStu.admissionNumber",
                class: "$$scoreStu.class",
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
            $map: {
              input: "$scoresAndStudent",
              as: "scoreStu",
              in: {
                name: "$$scoreStu.name",
                admissionNumber: "$$scoreStu.admissionNumber",
                scores: "$$scoreStu.score",
                total: "$$scoreStu.total.score",
                class: "$$scoreStu.class",
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
          admissionNumber: 1,
          name: 1,
          scores: 1,
          total: 1,
          avg: 1,
          low: 1,
          high: 1,
          class: 1,
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
          subject: { $arrayElemAt: ["$subject", 0] },
        },
      },
      {
        $project: {
          studentResults: 1,
          class: "$class.class",
          subject: "$subject",
        },
      },
      {
        $project: {
          studentResults: {
            $map: {
              input: "$studentResults",
              as: "scoreStu",
              in: {
                name: "$$scoreStu.name",
                admissionNumber: "$$scoreStu.admissionNumber",
                postion: "$$scoreStu.postion",
                total: "$$scoreStu.total",
                avg: "$$scoreStu.avg",
                low: "$$scoreStu.low",
                high: "$$scoreStu.high",
                score: {
                  $arrayToObject: {
                    $map: {
                      input: "$$scoreStu.scores",
                      as: "el",
                      in: { k: "$$el.test", v: "$$el.score" },
                    },
                  },
                },
              },
            },
          },
          class: "$class",
          subject: "$subject",
        },
      },
    ]).exec((err, result) => {
      if (err) {
        return next(new APIError("User Error", err.message));
      }
      if (result.length === 0)
        return next(new APIError("User Error", "No result was found"));
      return res.send(
        result.map((x) => {
          let studentData = x.studentResults.map((y) => {
            return {
              name: y.name,
              total: y.total,
              avg: y.avg,
              high: y.high,
              low: y.low,
              admissionNumber: y.admissionNumber,
              ...y.score,
              postion: y.postion,
            };
          });
          return { studentData: studentData, subject: x.subject };
        })
      );
    });
  } catch (error) {
    return next(new APIError("User Error", error.message));
  }
};

export const GetBehaviourResultComputation = (req, res, next) => {
  const { classN, arm } = req.params;
  if (!classN)
    return next(
      new APIError("Missing Parameter", missingParameterError("Class"))
    );
  if (!arm)
    return next(
      new APIError("Missing Parameter", missingParameterError("Arm"))
    );

  try {
    Student.aggregate([
      { $match: { class: new ObjectId(classN), arm: new ObjectId(arm) } },
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
            $concat: ["$firstName", " ", "$middleName", " ", "$srnName"],
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
    ]).exec((err, result) => {
      if (err) {
        console.log(err);
        return next(new APIError("User Error", err.message));
      }
      if (result.length === 0)
        return next(
          new APIError("User Error", "No behaviour result  was found")
        );
      return res.send(
        result.map((x) => {
          var data = {};
          for (var i = 0; i < x.behaviourScores.length; i++) {
            data[x.behaviourScores[i].behaviour] = x.behaviourScores[i].score;
          }
          return { name: x.name, admissionNumber: x.admissionNumber, ...data };
        })
      );
    });
  } catch (error) {
    return next(new APIError("User Error", error.message));
  }
};

export const GetSkillResultComputation = (req, res, next) => {
  const { classN, arm } = req.params;
  if (!classN)
    return next(
      new APIError("Missing Parameter", missingParameterError("Class"))
    );
  if (!arm)
    return next(
      new APIError("Missing Parameter", missingParameterError("Arm"))
    );

  try {
    Student.aggregate([
      { $match: { class: new ObjectId(classN), arm: new ObjectId(arm) } },
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
            $concat: ["$firstName", " ", "$middleName", " ", "$srnName"],
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
    ]).exec((err, result) => {
      if (err) {
        console.log(err);
        return next(new APIError("User Error", err.message));
      }
      if (result.length === 0)
        return next(new APIError("User Error", "No skill result  was found"));
      return res.send(
        result.map((x) => {
          var data = {};
          for (var i = 0; i < x.skillScores.length; i++) {
            data[x.skillScores[i].skill] = x.skillScores[i].score;
          }
          return { name: x.name, admissionNumber: x.admissionNumber, ...data };
        })
      );
    });
  } catch (error) {
    return next(new APIError("User Error", error.message));
  }
};

export const GetStudentCurrentClassAndArm = (req, res, next) => {
  const { admissionNumber } = req.body;
  if (!admissionNumber)
    return next(
      new APIError(
        "Missing Parameter",
        missingParameterError("Admission Number")
      )
    );
  Student.findOne({ admissionNumber })
    .populate("class arm")
    .then((data) => {
      return res.send({
        class: data.class ? data.class.name : "No Class",
        arm: data.arm ? data.arm.character : "No Arm",
      });
    })
    .catch((err) => {
      return next(new APIError("User Error", err.message));
    });
};

export default {
  createStudent,
  fetchStudent,
  deleteStudent,
  login,
  addSingleStudentBehaviourScore,
  addSingleStudentSkillScore,
  addSingleStudentTestScore,
  getStudentAllSubjectAndScore,
  getArmStudentSubjectScore,
  getAllArmStudentAndSubject,
  saveStudentScoreBySubject,
  saveStudentScore,
  getStudentBehaviourScore,
  getStudentSkillScore,
  saveStudentBehaviourScore,
  saveStudentSkillScore,
  fixDatabase,
  getGraphForTotalStudentInAClass,
  getStudentByAdmissionNumber,
  editStudent,
  validateScoreBySubject,
  ValidateResultScoreByArm,
  ValidateResultScoreByClass,
  GetResultComputation,
  GetBehaviourResultComputation,
  GetSkillResultComputation,
  GetStudentCurrentClassAndArm,
};
