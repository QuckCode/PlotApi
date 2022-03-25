import controller from "./controller";
import { app } from "../../server";
import { EditSchoolSetting, GetSchoolSetting, School } from "./routes";

app.post(School, controller.createSchool);

app.get(School, controller.getSchools);

app.get(GetSchoolSetting, controller.getSchoolsSetting);

app.patch(EditSchoolSetting, controller.editSchoolsSetting);

app.delete(School, controller.deleteSchool);
