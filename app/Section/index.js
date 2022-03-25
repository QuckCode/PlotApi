import controller from "./controller";
import { app } from "../../server";
import {
  AddSectionBehaviour,
  AddSectionSkill,
  RemoveSectionBehaviour,
  RemoveSectionSkill,
  Section,
  SectionBehaviour,
  SectionFetch,
  SectionSkill,
} from "./routes";
const passport = require("passport");

app.post(Section, controller.createSection);

app.get(SectionFetch, controller.fetchSection);

app.post(AddSectionBehaviour, controller.addBehaviourSection);

app.get(SectionBehaviour, controller.fetchSectionBehaviour);

app.post(RemoveSectionBehaviour, controller.removeBehaviourSection);

app.post(AddSectionSkill, controller.addSkillSection);

app.get(SectionSkill, controller.fetchSkillSection);

app.post(RemoveSectionSkill, controller.removeSkillSection);

app.delete(Section, controller.deleteSection);
