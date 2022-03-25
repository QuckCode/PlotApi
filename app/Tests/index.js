import controller from "./controller";
import { app } from "../../server";
import {
  GetContinuosAssessmentSheetAllSubject,
  GetContinuosAssessmentSheetSingleSubject,
  Test,
  TestFetch,
} from "./routes";

app.post(Test, controller.createTest);

app.get(TestFetch, controller.fetchTest);

app.delete(Test, controller.deleteTest);

app.post(
  GetContinuosAssessmentSheetAllSubject,
  controller.continuosAssessmentSheetAllSubject
);

app.post(
  GetContinuosAssessmentSheetSingleSubject,
  controller.continuosAssessmentSheetSingleSubject
);
