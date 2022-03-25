import DepartmentController from "./controller";
import { app } from "../../server";
import { Department, EdItDepartment, FetchDepartment } from "./routes";

app.post(Department, DepartmentController.createDepartment);

app.get(FetchDepartment, DepartmentController.fetchDepartment);

app.post(EdItDepartment, DepartmentController.editDepartment);
