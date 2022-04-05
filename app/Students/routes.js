export const Student = "/student";
export const LoginStudent = "/login/student";
export const EditStudent = "/student/edit";
export const DeleteStudent = "/student/:id";
export const StudentFetch = "/student/:school";
export const AddStudentBehaviourScore = "/student/score/behaviour/add";
export const AddStudentSkillScore = "/student/score/skill/add";
export const AddStudentTestScore = "/student/score/test/add";
export const GetStudentSubjectAndScore =
  "/student/subject/score/test/:studentId";
export const GetArmStudentSubjectAndScore = "/student/arm/subject/score";
export const GetArmStudentSubjectAndScoreAll = "/student/arm/subject/score/all";
export const SaveStudentScoreBySubject = "/student/subject/score/save";
export const SaveStudentScore = "/student/score/save";
export const GetStudentBehaviourScore = "/student/arm/behaviour/score";
export const GetStudentSkillScore = "/student/arm/skill/score";
export const SaveStudentBehaviourScore = "/student/arm/behaviour/score/save";
export const SaveStudentSkillScore = "/student/arm/skill/score/save";
export const GraphOfTotalStudentInAClass = "/graph/class/total/:school";
export const GetStudentByAdmission =
  "/student/admissionNumber/:admissionNumber";
export const ValidateSubjectByScore = "/student/validate/:classN/:arm/:subject";
export const ValidateResultByArm = "/student/validate/:classN/:arm";
export const ValidateResultByClass = "/student/validate/:classN";
export const GetComputeResultByArm = "/student/result/compute/:classN/:arm";
export const GetComputeBehaviourResultByArm =
  "/student/behaviour/compute/:classN/:arm";
export const GetComputeSkillResultByArm = "/student/skill/compute/:classN/:arm";
export const GetStudentClassAndArmByAdmissionNumber = "/student/ClassAndArm";
export const SetStudentSubjectGroup = "/student/subjectGroup";
