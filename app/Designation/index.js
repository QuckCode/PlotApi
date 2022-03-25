import DesignationController from "./controller";
import { app } from "../../server";
import {
  DeleteDesignation,
  Designation,
  EditDesignation,
  FetchDesignation,
} from "./routes";

app.post(
  Designation,
  // passport.authenticate('jwt', {session:false}),
  DesignationController.createDesignation
);

app.get(FetchDesignation, DesignationController.fetchDesignation);

app.post(EditDesignation, DesignationController.editDesignation);

app.get(DeleteDesignation, DesignationController.deleteDesignation);
