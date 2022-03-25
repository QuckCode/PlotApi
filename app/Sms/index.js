import controller from "./controller";
import { app } from "@root/server";
import {
  GetAllStudentPhoneNumbers,
  GetAllStudentPhoneNumbersInAClass,
  GetAllStudentPhoneNumbersInAnArm,
  GetBalance,
  GetSms,
  SendSms,
} from "./routes";

app.get(GetAllStudentPhoneNumbers, controller.getAllStudentPhoneNumber);
app.get(
  GetAllStudentPhoneNumbersInAClass,
  controller.getAllStudentPhoneNumberInAClass
);
app.get(
  GetAllStudentPhoneNumbersInAnArm,
  controller.getAllStudentPhoneNumberInAnArm
);
app.post(SendSms, controller.sendMessage);
app.post(GetSms, controller.getAllSchoolMessage);
app.get(GetBalance, controller.getUserBalance);
