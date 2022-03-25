import StaffController from "./controller";
import {
  AddStaffClass,
  AddStaffSubject,
  FetchStaffClasses,
  FetchStaffSubject,
  LoginAdmin,
  LoginStaff,
  RemoveStaffClass,
  RemoveStaffSubject,
  Staff,
  StaffFetch,
} from "./routes";
import { app } from "../../server";
import passport from "passport";

app.post(Staff, StaffController.createStaff);
app.get(StaffFetch, StaffController.fetchStaff);
app.post(LoginStaff, StaffController.login(passport));
app.post(LoginAdmin, StaffController.loginAdmin(passport));

app.get(FetchStaffClasses, StaffController.fetchStaffClasses);
app.patch(AddStaffClass, StaffController.addStaffClass);
app.patch(RemoveStaffClass, StaffController.removeStaffClass);

app.get(FetchStaffSubject, StaffController.fetchStaffSubjects);
app.patch(AddStaffSubject, StaffController.addStaffSubject);
app.patch(RemoveStaffSubject, StaffController.removeStaffSubject);
