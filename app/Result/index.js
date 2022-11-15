var ResultController = require("./controller");
const {
  ComputeResult,
  ReComputeResult,
  ComputeResultBehaviour,
  ReComputeResultBehaviour,
  ComputeResultSkill,
  ReComputeResultSkill,
  PrintResultByArm,
  PromoteResult,
  AddNotice,
  RemoveNotice,
  GetAllNotice,
  GraduateResult,
  PreviousResult,
  PromoteResultSingle,
} = require("./routes");
const { app } = require("../../server");

app.post(ComputeResult, ResultController.PerformResultComputation);

app.post(ReComputeResult, ResultController.PerformResultReComputation);

app.post(
  ComputeResultBehaviour,
  ResultController.PerformBehaviourResultComputation
);

app.post(
  ReComputeResultBehaviour,
  ResultController.PerformBehaviourResultReComputation
);

app.post(ComputeResultSkill, ResultController.PerformSkillResultComputation);

app.post(
  ReComputeResultSkill,
  ResultController.PerformSkillResultReComputation
);

app.post(PrintResultByArm, ResultController.PrintResultForArm);

app.put(AddNotice, ResultController.AddNotice);

app.delete(RemoveNotice, ResultController.RemoveNotice);

app.get(GetAllNotice, ResultController.GetAllNotice);

app.post(PromoteResult, ResultController.PromoteByResult);

app.post(PromoteResultSingle, ResultController.PromoteSingleStudent);

app.post(GraduateResult, ResultController.GradateStudent);

app.post(PreviousResult, ResultController.PreviousResult);
