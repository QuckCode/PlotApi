import controller from "./controller";
import { app } from "../../server";
import { Skill, SkillFetch } from "./routes";

app.post(Skill, controller.createSkill);

app.get(SkillFetch, controller.fetchSkill);

app.delete(Skill, controller.deleteSkills);
