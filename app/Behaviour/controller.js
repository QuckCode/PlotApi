import Behaviour from "./model";
import {
  APIError,
  DuplicateError,
  InValidParameterError,
  MissingParameterError,
} from "@errors/baseErrors";
import { isValidSchoolById } from "../School/functions";
import { Types } from "mongoose";
const { ObjectId } = Types;

const createBehaviour = async (req, res, next) => {
  const { name, school } = req.body;
  if (!name) throw new MissingParameterError("Behaviour name");
  if (!school) throw new MissingParameterError("School");

  if (!(await isValidSchoolById(school)))
    throw new InValidParameterError("School");

  try {
    let behaviour = await Behaviour.findOne({
      name: { $regex: new RegExp("^" + name.toLowerCase(), "i") },
      school: ObjectId(school),
    });

    if (!behaviour) {
      Behaviour.create({ name, school });
      return res.send({
        status: "Success",
        message: `Create Behaviour ${name} Successfully `,
      });
    }

    throw new DuplicateError();
  } catch (error) {
    throw new APIError(error.title, error.message);
  }
};

const fetchBehaviour = async (req, res, next) => {
  const { school } = req.params;
  if (!school) throw new MissingParameterError("School");

  if (!(await isValidSchoolById(school)))
    throw new InValidParameterError("School");

  try {
    let behaviors = await Behaviour.find({ school }).lean().exec();
    return res.send(behaviors);
  } catch (error) {
    throw new APIError(error.title, error.message);
  }
};

const deleteBehaviour = async (req, res, next) => {
  const { school, behaviourId } = req.body;
  if (!school) throw new MissingParameterError("School");
  if (!(await isValidSchoolById(school)))
    throw new InValidParameterError("School");

  if (!behaviourId) throw new new MissingParameterError("behaviour")();

  try {
    let foundBehaviour = await Behaviour.findByIdAndDelete(behaviourId);
    return res.send({
      message: `Deleted Behaviour With Name ${foundBehaviour.name}`,
    });
  } catch (error) {
    throw new APIError(error.title, error.message);
  }
};

export default {
  createBehaviour,
  fetchBehaviour,
  deleteBehaviour,
};
