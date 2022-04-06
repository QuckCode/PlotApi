import StudentController from "./controller";
import {
  AddStudentBehaviourScore,
  AddStudentSkillScore,
  AddStudentTestScore,
  DeleteStudent,
  EditStudent,
  GetArmStudentSubjectAndScore,
  GetArmStudentSubjectAndScoreAll,
  GetComputeBehaviourResultByArm,
  GetComputeResultByArm,
  GetComputeSkillResultByArm,
  GetStudentBehaviourScore,
  GetStudentByAdmission,
  GetStudentClassAndArmByAdmissionNumber,
  GetStudentSkillScore,
  GetStudentSubjectAndScore,
  GraphOfTotalStudentInAClass,
  LoginStudent,
  SaveStudentBehaviourScore,
  SaveStudentScore,
  SaveStudentScoreBySubject,
  SaveStudentSkillScore,
  SetStudentAttendance,
  SetStudentSubjectGroup,
  Student,
  StudentFetch,
  ValidateResultByArm,
  ValidateResultByClass,
  ValidateSubjectByScore,
} from "./routes";
import { app } from "../../server";
import passport from "passport";
const { getStudentAllSubjectAndScore } = require("./controller");

app.post(Student, StudentController.createStudent);
app.post(EditStudent, StudentController.editStudent);
app.delete(DeleteStudent, StudentController.deleteStudent);

app.get(StudentFetch, StudentController.fetchStudent);

app.post(
  AddStudentBehaviourScore,

  StudentController.addSingleStudentBehaviourScore
);

app.post(AddStudentSkillScore, StudentController.addSingleStudentSkillScore);

app.post(AddStudentTestScore, StudentController.addSingleStudentTestScore);

app.get(
  GetStudentSubjectAndScore,
  StudentController.getStudentAllSubjectAndScore
);

app.post(
  GetArmStudentSubjectAndScore,
  StudentController.getArmStudentSubjectScore
);

app.post(
  GetArmStudentSubjectAndScoreAll,
  StudentController.getAllArmStudentAndSubject
);

app.post(
  SaveStudentScoreBySubject,
  StudentController.saveStudentScoreBySubject
);

app.post(SaveStudentScore, StudentController.saveStudentScore);

app.post(GetStudentBehaviourScore, StudentController.getStudentBehaviourScore);

app.post(GetStudentSkillScore, StudentController.getStudentSkillScore);

app.post(
  SaveStudentBehaviourScore,
  StudentController.saveStudentBehaviourScore
);

app.post(SaveStudentSkillScore, StudentController.saveStudentSkillScore);

app.post(LoginStudent, StudentController.login(passport));

app.get("/fixDatabase", StudentController.fixDatabase);

app.get(
  GraphOfTotalStudentInAClass,
  StudentController.getGraphForTotalStudentInAClass
);

app.get(GetStudentByAdmission, StudentController.getStudentByAdmissionNumber);

app.get(ValidateSubjectByScore, StudentController.validateScoreBySubject);

app.get(ValidateResultByArm, StudentController.ValidateResultScoreByArm);

app.get(ValidateResultByClass, StudentController.ValidateResultScoreByClass);

app.get(GetComputeResultByArm, StudentController.GetResultComputation);

app.get(
  GetComputeBehaviourResultByArm,
  StudentController.GetBehaviourResultComputation
);

app.get(
  GetComputeSkillResultByArm,
  StudentController.GetSkillResultComputation
);

app.post(
  GetStudentClassAndArmByAdmissionNumber,
  StudentController.GetStudentCurrentClassAndArm
);

app.post(SetStudentSubjectGroup, StudentController.setStudentSubjectGroup);
app.post(SetStudentAttendance, StudentController.setStudentAttendance);
