import axios from "axios";
import { School } from "../../app/School/routes";
import { sas } from "../../app/utils";
import mongoose from "mongoose";
import faker from "faker";
const { ObjectId } = mongoose.Types;

let id = String(ObjectId());
export let school = {
  name: `Test${Math.random()}`,
  prefix: `XAx${Math.random()}`,
  address: "Angwan Tomato, Gauraka, Tafa L.G.A, Niger State",
  phoneNumber: "+2348034055074",
  email: "email",
  id: id,
  school: id,
};

let sectionRequest = {
  section: `${faker.commerce.department()} section`,
  school: school.id,
};

let behaviourRequest = {
  name: `${faker.commerce.department()}`,
  school: school.id,
};

let skillRequest = {
  name: `${faker.commerce.department()}`,
  school: school.id,
};

export let newName = "New Name";

const createSchool = async () => {
  return await axios.post(sas(School), school);
};

const deleteSchool = async () => {
  const data = JSON.stringify({ school: school.id });
  const config = {
    method: "delete",
    url: sas(School),
    headers: { "Content-Type": "application/json" },
    data,
  };

  return await axios(config);
};

export default {
  createSchool,
  deleteSchool,
  school,
  newName,
};
