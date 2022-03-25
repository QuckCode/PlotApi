import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

export const phoneNumberAggregation = (school) => {
  return [
    { $match: { school: new ObjectId(`${school}`) } },
    { $project: { phone: 1 } },
  ];
};

export const phoneNumberAggregationByClass = (classId) => {
  return [
    { $match: { class: new ObjectId(`${classId}`) } },
    { $project: { phone: 1 } },
  ];
};
