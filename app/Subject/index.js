import controller from "./controller";
import { app } from "../../server";
import {
  CreateSubjectGroup,
  DeleteSubjectGroup,
  EditSubjectGroup,
  FetchSubjectBySchool,
  FetchSubjectGroup,
  Subject,
  SubjectFetch,
} from "./routes";

app.post(Subject, controller.createSubject);

app.get(SubjectFetch, controller.fetchSubject);

app.delete(Subject, controller.deleteSubject);

app.post(CreateSubjectGroup, controller.createSubjectGroup);

app.get(FetchSubjectGroup, controller.fetchSubjectGroup);

app.patch(EditSubjectGroup, controller.editSubjectGroup);

app.delete(DeleteSubjectGroup, controller.deleteSubjectGroup);

app.get(FetchSubjectBySchool, controller.fetchSubjectGroupBySchool);
