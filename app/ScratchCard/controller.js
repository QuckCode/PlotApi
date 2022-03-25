import ScratchCard from "./model";
import {
  APIError,
  InValidParameterError,
  MissingParameterError,
} from "@errors/baseErrors";
import { generatePinSync } from "secure-pin";
import { v4 as uuid } from "uuid";
import School from "../School/model";

export const generateScratchCard = async (req, res, next) => {
  const { amount, numberOfCard, school } = req.body;
  if (!amount) throw new MissingParameterError("Amount");

  if (!numberOfCard) throw new MissingParameterError("Number Of Recharge Card");

  if (!school) throw new MissingParameterError("School");

  if (!Number.isInteger(amount)) throw new InValidParameterError("Amount");

  if (!Number.isInteger(numberOfCard))
    throw new InValidParameterError("Number Of Recharge Card is not a number");

  let foundSchool = await School.findById(school).lean().exec();
  if (!foundSchool) throw new InValidParameterError("School");

  const scratchCards = Array(numberOfCard)
    .fill()
    .map(() => ({
      pin: generatePinSync(12),
      serialNumber: uuid(),
      amount,
      school,
    }));

  try {
    await ScratchCard.insertMany(scratchCards);
    return res.send({
      title: "success",
      message: "Generate scratch cards successfully",
    });
  } catch (error) {
    throw new APIError(error.title, error.message);
  }
};

export const getAllScratchCard = async (req, res, next) => {
  const { school } = req.params;
  if (!school) throw new MissingParameterError("School");
  if (!(await School.validateById(school)))
    throw new InValidParameterError("School");
  try {
    let scratchCards = await ScratchCard.find({ school }).lean();
    return res.send(scratchCards);
  } catch (error) {
    throw new APIError(error.title, error.message);
  }
};

export const getAllUsedScratchCard = async (req, res, next) => {
  const { school } = req.params;
  if (!school) throw new MissingParameterError("School");
  if (!(await School.validateById(school)))
    throw new InValidParameterError("School");

  try {
    let scratchCards = await ScratchCard.find({ school, used: true }).lean();
    return res.send(scratchCards);
  } catch (error) {
    throw new APIError("User Error", error.message);
  }
};

export const useScratchCard = async (req, res, next) => {
  const { pin, school } = req.body;

  if (!pin) throw new MissingParameterError("Pin");

  if (!school) throw new MissingParameterError("School");
  if (!(await School.validateById(school)))
    return InValidParameterError("School");
  if (pin.length !== 12)
    throw new APIError("Invalid  Pin", "User Pin is  Invalid");

  try {
    let scratchCard = await ScratchCard.findOne({ pin, school });
    if (!scratchCard) throw new APIError("Invalid  Pin", "User Pin is Invalid");
    if (scratchCard.used)
      throw new APIError("Invalid  Pin", "User Pin has being used");
    await ScratchCard.updateOne({ _id: scratchCard._id }, { used: true });
    return res.send({ title: "Success", message: "Successful used pin " });
  } catch (error) {
    throw new APIError(error.title, error.message);
  }
};

export const getScratchCardStat = async (req, res, next) => {
  const { school } = req.params;
  if (!school) throw new MissingParameterError("School");
  try {
    let totalScratchCard = await ScratchCard.countDocuments({ school });
    console.log(totalScratchCard);
    let totalUsedScratchCard = await ScratchCard.countDocuments({
      school,
      used: true,
    });
    let totalNotUsedScratchCard = totalScratchCard - totalUsedScratchCard;
    return res.send({
      totalScratchCard,
      totalUsedScratchCard,
      totalNotUsedScratchCard,
    });
  } catch (error) {
    throw new APIError("User Error", error.message);
  }
};

export const deleteUsedScratchCard = async (req, res, next) => {
  const { serialNumber } = req.params;
  if (!serialNumber) throw new MissingParameterError("Serial Number");

  try {
    let scratchCard = await ScratchCard.findOne({ serialNumber });
    if (!scratchCard)
      throw new APIError("Pin Does Not exist", "This pin does not exist");
    await ScratchCard.deleteOne({ serialNumber });
    return res.send({
      title: "Success",
      message: "Successful Deleted Pin ",
    });
  } catch (error) {
    throw new APIError(error.title, error.message);
  }
};

export default {
  generateScratchCard,
  getAllScratchCard,
  useScratchCard,
  deleteUsedScratchCard,
  getAllUsedScratchCard,
  getScratchCardStat,
};
