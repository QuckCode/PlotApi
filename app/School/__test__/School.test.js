import axios from "axios";
import { School, GetSchoolSetting, EditSchoolSetting } from "../routes";
import { sas } from "../../utils";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

let id = String(ObjectId());
describe("School Routes  ", () => {
  let school = {
    name: `Test${Math.random()}`,
    prefix: `XAx${Math.random()}`,
    address: "Angwan Tomato, Gauraka, Tafa L.G.A, Niger State",
    phoneNumber: "+2348034055074",
    email: "email",
    id: id,
    school: id,
  };
  let newName = "New Name";

  it("Can Create School", async () => {
    let response = await axios.post(sas(School), school);
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ message: "Created School" });
  });

  it("Can Fetch School", async () => {
    let response = await axios.get(sas(School));
    expect(response.status).toBe(200);
    expect(response.data.length > 0).toEqual(true);
  });

  it("Can Get School Setting ", async () => {
    let response = await axios.get(
      sas(GetSchoolSetting.replace(":school", school.id))
    );
    expect(response.status).toBe(200);
    expect(response.data._id).toEqual(id);
    expect(response.data.name).toEqual(school.name);
    expect(response.data.schoolPrefix).toEqual(school.prefix);
  });

  it("Can Change School Setting", async () => {
    let fetchSchoolResponse = await axios.get(
      sas(GetSchoolSetting.replace(":school", school.id))
    );
    expect(fetchSchoolResponse.data._id).toEqual(id);
    expect(fetchSchoolResponse.data.name).toEqual(school.name);
    expect(fetchSchoolResponse.data.schoolPrefix).toEqual(school.prefix);
    fetchSchoolResponse.data.name = newName;

    let saveSchoolSettings = await axios.patch(sas(EditSchoolSetting), {
      ...fetchSchoolResponse.data,
      school: fetchSchoolResponse.data._id,
    });
    expect(saveSchoolSettings.status).toBe(200);
    expect(saveSchoolSettings.data).toEqual({
      message: "Saved Setting ",
    });
  });

  it("Can Delete School", async () => {
    const data = JSON.stringify({ school: id });
    const config = {
      method: "delete",
      url: sas(School),
      headers: { "Content-Type": "application/json" },
      data,
    };

    let response = await axios(config);
    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      message: `Deleted School With Name ${newName}`,
    });
  });
});
