import Section from "./model";
import {
  APIError,
  DuplicateError,
  InValidParameterError,
  MissingParameterError,
  UserFacingError,
} from "@errors/baseErrors";
import { Types } from "mongoose";
const { ObjectId } = Types;

const createSection = async (req, res, next) => {
  const { section, school } = req.body;

  if (!section) throw new MissingParameterError("Section");
  if (!school) throw new MissingParameterError("School");

  try {
    let foundSection = await Section.findOne({
      name: { $regex: new RegExp("^" + section.toLowerCase(), "i") },
      school: ObjectId(school),
    }).lean();

    if (!foundSection) {
      await Section.create({ section, school });
      return res.send({
        status: "success",
        message: "Create section successfully",
      });
    }
    throw new DuplicateError("Section");
  } catch (error) {
    throw new APIError(error.title, error.message);
  }
};

const fetchSection = async (req, res, next) => {
  const { school } = req.params;
  if (!school) throw new MissingParameterError("School");

  try {
    let sections = await Section.find({ school }).lean();
    return res.send(sections);
  } catch (error) {
    throw new APIError(error.title, error.message);
  }
};

const addBehaviourSection = async (req, res, next) => {
  const { sectionId, behaviour } = req.body;

  if (!sectionId) throw new MissingParameterError("Section");
  if (!behaviour) throw new MissingParameterError("Behaviors");

  if (behaviour.length == 0)
    throw new UserFacingError(null, "Length is to short");

  try {
    let section = await Section.findById(sectionId).lean();

    await Section.findOneAndUpdate(
      { _id: section._id },
      { $addToSet: { behaviors: behaviour } }
    );
    return res.send({
      title: "success",
      message: "Added Behaviour from Section",
    });
  } catch (error) {
    throw new APIError(error.title, error.message);
  }
};

const fetchSectionBehaviour = async (req, res, next) => {
  const { sectionId } = req.params;
  if (!sectionId) throw new MissingParameterError("Section");

  try {
    let section = await Section.findById(sectionId)
      .lean()
      .populate("behaviors");

    if (!section) {
      throw next(new InValidParameterError("School"));
    }

    return res.send(section.behaviors);
  } catch (error) {
    throw new APIError(error.title, error.message);
  }
};

const removeBehaviourSection = async (req, res, next) => {
  const { sectionId, behaviour } = req.body;
  // validate section

  if (!sectionId) throw new MissingParameterError("Section");
  if (!behaviour) throw new MissingParameterError("Behaviors");

  if (behaviour.length == 0)
    throw new UserFacingError(null, "Length is to short");

  try {
    let section = await Section.findById(sectionId).lean();

    await Section.findOneAndUpdate(
      { _id: section._id },
      { $pullAll: { behaviors: behaviour } }
    );

    return res.send({
      title: "success",
      message: "Removed Behaviors from Section",
    });
  } catch (error) {
    throw new APIError(error.title, error.message);
  }
};

const addSkillSection = async (req, res, next) => {
  const { sectionId, skills } = req.body;
  if (!sectionId) throw new MissingParameterError("Section");
  if (!skills) throw new MissingParameterError("Skills");

  if (skills.length == 0) throw new UserFacingError(null, "Length is to short");

  try {
    let section = await Section.findById(sectionId).lean();

    await Section.findOneAndUpdate(
      { _id: section._id },
      { $addToSet: { skills } }
    );
    return res.send({
      title: "success",
      message: "Added Skills from Section",
    });
  } catch (error) {
    throw new APIError(error.title, error.message);
  }
};

const fetchSkillSection = async (req, res, next) => {
  const { sectionId } = req.params;
  if (!sectionId) throw new MissingParameterError("Section");

  try {
    let section = await Section.findById(sectionId).lean().populate("skills");

    if (!section) {
      throw next(new InValidParameterError("School"));
    }

    return res.send(section.skills || []);
  } catch (error) {
    throw new APIError(error.tile, error.message);
  }
};

const removeSkillSection = async (req, res, next) => {
  const { sectionId, skills } = req.body;

  if (!sectionId) throw new MissingParameterError("Section");
  if (!skills) throw new MissingParameterError("Skills");

  if (skills.length == 0) throw new UserFacingError(null, "Length is to short");

  try {
    let section = await Section.findById(sectionId).lean();
    await Section.findOneAndUpdate(
      { _id: section._id },
      { $pullAll: { skills: skills } }
    );

    return res.send({
      title: "success",
      message: "Removed Skills from Section",
    });
  } catch (error) {
    throw new APIError(error.title, error.message);
  }
};

const deleteSection = async (req, res, next) => {
  const { sectionId } = req.body;

  if (!sectionId) throw new MissingParameterError("Section");
  if (await Section.validateById(sectionId)) {
    throw next(new InValidParameterError("Section"));
  }

  try {
    let { section } = await Section.findByIdAndDelete(sectionId).lean();

    return res.send({
      title: "success",
      message: `Deleted ${section} Section  `,
    });
  } catch (error) {
    throw new APIError(error.title, error.message);
  }
};

export default {
  createSection,
  fetchSection,
  addBehaviourSection,
  removeBehaviourSection,
  fetchSectionBehaviour,
  addSkillSection,
  removeSkillSection,
  fetchSkillSection,
  deleteSection,
};
