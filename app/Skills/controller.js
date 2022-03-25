import Skill from "./model";
import { APIError } from "@errors/baseErrors";
import mongoose from "mongoose";
import { invalidParameterError, missingParameterError } from "../utils/error";
import { isValidSchoolById } from "../School/functions";
const { ObjectId } = mongoose.Types;

const createSkill = async (req, res, next) => {
  const { name, school } = req.body;
  if (!name)
    return next(
      new APIError("Missing Parameter", missingParameterError("Skill name"))
    );
  if (!school)
    return next(
      new APIError("Missing Parameter", missingParameterError("School"))
    );
  if (!(await isValidSchoolById(school)))
    return next(
      new APIError("Invalid Parameter", invalidParameterError("School"))
    );

  try {
    let skill = await Skill.findOne({
      name: { $regex: new RegExp("^" + name.toLowerCase(), "i") },
      school: ObjectId(school),
    });

    if (!skill) {
      Skill.create({ name, school });
      return res.send({
        status: "success",
        message: `Create Skill ${name} Successfully`,
      });
    }

    throw new APIError(
      "Duplicate Error",
      "You are to insert data that already exist  "
    );
  } catch (error) {
    return next(new APIError(error.title, error.message));
  }
};

const fetchSkill = async (req, res, next) => {
  const { school } = req.params;
  if (!school)
    return next(
      new APIError("Missing Parameter", missingParameterError("School"))
    );
  if (!(await isValidSchoolById(school)))
    return next(
      new APIError("Invalid Parameter", invalidParameterError("School"))
    );

  try {
    let skills = await Skill.find({ school }).lean().exec();
    return res.send(skills);
  } catch (error) {
    return next(new APIError(error.title, error.message));
  }
};

const deleteSkills = async (req, res, next) => {
  const { school, skillId } = req.body;
  if (!school)
    return next(
      new APIError("Missing Parameter", missingParameterError("School"))
    );
  if (!(await isValidSchoolById(school)))
    return next(
      new APIError("Invalid Parameter", invalidParameterError("School"))
    );

  if (!skillId)
    return next(
      new APIError("Missing Parameter", missingParameterError("Skill"))
    );

  try {
    let foundSkill = await Skill.findByIdAndDelete(skillId);
    return res.send({
      message: `Deleted Skill With Name ${foundSkill.name}`,
    });
  } catch (error) {
    return next(new APIError(error.title, error.message));
  }
};

export default {
  createSkill,
  fetchSkill,
  deleteSkills,
};
