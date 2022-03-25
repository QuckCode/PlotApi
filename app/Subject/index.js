import controller from "./controller";
import { app } from "../../server";
import { Subject, SubjectFetch } from "./routes";

app.post(Subject, controller.createSubject);

app.get(SubjectFetch, controller.fetchSubject);

app.delete(Subject, controller.deleteSubject);
