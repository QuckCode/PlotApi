import ArmController from "./controller";
import { app } from "../../server";
import { Arm, ArmFetch, GetAllStudentInArm } from "./routes";

app.post(Arm, ArmController.createArm);

app.get(ArmFetch, ArmController.fetchArm);

app.get(GetAllStudentInArm, ArmController.getAllStudentInArm);
