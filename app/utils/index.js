const { APIError } = require("../../errors/baseErrors");

function getSum(total) {
  return total.reduce((a, b) => a + b || 0);
}

function scoreToText(num) {
  const score = ["Very Poor", "Poor", "Good", "Very Good", "Excellent"];
  if (num > 5) return "";
  return score[num - 1];
}

export const sas = (apiRoute) => {
  return `http://localhost:4000${apiRoute}`;
};

function parseStudentScoreList(score, subjectList) {
  let data = [];
  for (const subject of subjectList) {
    data.push({
      subject: subject._id,
      subjectName: subject.name,
      test: subject.tests.map((x) => {
        return {
          test: x._id,
          testName: x.name,
          score:
            score.find((d) => {
              return (
                String(d.subject) === String(subject._id) &&
                String(d.test) === String(x._id)
              );
            }) !== undefined
              ? score.find((d) => {
                  return (
                    String(d.subject) === String(subject._id) &&
                    String(d.test) === String(x._id)
                  );
                }).score
              : 0,
          hasScore:
            score.find((d) => {
              return (
                String(d.subject) === String(subject._id) &&
                String(d.test) === String(x._id)
              );
            }) !== undefined
              ? true
              : false,
        };
      }),
    });
  }
  return data;
}

function parseStudentArmSubject(subject, test, students) {
  // console.log(subject, test, students)
  let data = [];
  for (const student of students) {
    let isSubject = student.testScores.find((x) => {
      if (x === null) return false;
      return (
        String(subject._id) === String(x.subject) &&
        String(test._id) === String(x.test)
      );
    });
    data.push({
      userId: student._id,
      name: `${student.firstName ? student.firstName : ""} ${
        student.middleName ? student.middleName : ""
      } ${student.srnName ? student.srnName : ""}`,
      passport: student.passport,
      admissionNumber: student.admissionNumber,
      score: isSubject !== undefined ? isSubject.score : 0,
      hasScore: isSubject !== undefined ? true : false,
    });
  }
  return data;
}

function parseAllArmStudentTest(students, test) {
  const data = [];
  for (const student of students) {
    let studentTestScore = student.class.subjects.map((x) => {
      let scorePosition = student.testScores.findIndex(
        (y) =>
          String(y.test) === String(test._id) &&
          String(y.subject) === String(x._id)
      );
      let score =
        student.testScores[scorePosition] !== undefined
          ? student.testScores[scorePosition].score
          : 0;
      let hasScore =
        student.testScores[scorePosition] !== undefined ? true : false;
      return {
        name: x.name,
        hasScore,
        score,
        subjectId: x._id,
        userId: student._id,
        test: test._id,
      };
    });
    data.push({
      userId: student._id,
      class: student.class._id,
      passport: student.passport,
      admissionNumber: student.admissionNumber,
      name: `${student.firstName} ${
        student.middleName ? student.middleName : ""
      } ${student.srnName}`,
      studentTestScore,
    });
  }
  return data;
}

const parseBehaviourScoreByStudent = (userData, next) => {
  const data = [];
  for (const students of userData) {
    if (students.behaviours.length === 0) {
      return next(
        new APIError("User Error", "Please student don't have any behaviors ")
      );
    }
    const behaviours = students.behaviours.map((x) => {
      let scoreIndex = students.behaviourScores.findIndex(
        (y) =>
          String(y.behaviour) === String(x._id) &&
          String(y.class) === String(students.class._id)
      );
      return {
        name: x.name,
        _id: x._id,
        hasScore: scoreIndex !== -1 ? true : false,
        score:
          scoreIndex !== -1 ? students.behaviourScores[scoreIndex].score : 0,
      };
    });
    data.push({
      name: students.name,
      userId: students._id,
      admissionNumber: students.admissionNumber,
      passport: students.passport,
      behaviours,
    });
  }
  return data;
};

const parseSkillScoreByStudent = (userData, next) => {
  const data = [];
  for (const students of userData) {
    if (students.skills.length === 0) {
      return next(
        new APIError("User Error", "Please student don't have any skill ")
      );
    }
    const skills = students.skills.map((x) => {
      let scoreIndex = students.skillScores.findIndex(
        (y) =>
          String(y.skill) === String(x._id) &&
          String(y.class) === String(students.class._id)
      );
      return {
        name: x.name,
        _id: x._id,
        hasScore: scoreIndex !== -1 ? true : false,
        score: scoreIndex !== -1 ? students.skillScores[scoreIndex].score : 0,
      };
    });
    data.push({
      name: students.name,
      userId: students._id,
      admissionNumber: students.admissionNumber,
      passport: students.passport,
      skills,
    });
  }
  return data;
};

export default {
  getSum,
  scoreToText,
  parseStudentScoreList,
  parseStudentArmSubject,
  parseAllArmStudentTest,
  parseBehaviourScoreByStudent,
  parseSkillScoreByStudent,
  sas,
};
