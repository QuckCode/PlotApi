import ClassController from "./controller";
import { app } from "@root/server";
import {
  AddClassSubject,
  AddClassTest,
  Class,
  ClassFetch,
  GetAllStudentInAClass,
  GetClassSubject,
  GetClassTest,
  HasSubjectGroup,
  RemoveClassSubject,
  RemoveClassTest,
  SetHasSubjectGroup,
} from "./routes";

app.post(Class, ClassController.createClass);

app.get(ClassFetch, ClassController.fetchClass);

app.post(AddClassSubject, ClassController.addClassSubject);

app.post(RemoveClassSubject, ClassController.removeClassSubject);

app.get(GetClassSubject, ClassController.fetchClassSubject);

app.post(AddClassTest, ClassController.addClassTest);

app.post(RemoveClassTest, ClassController.removeClassTest);

app.get(GetClassTest, ClassController.fetchClassTest);

app.get(GetAllStudentInAClass, ClassController.getAllStudentInAClass);

app.delete(Class, ClassController.deleteClass);

app.post(SetHasSubjectGroup, ClassController.setHasSubjectGroup);

app.get(HasSubjectGroup, ClassController.hasSubjectGroup);
