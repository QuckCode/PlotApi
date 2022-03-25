import axios from "axios";
import { Test, TestFetch } from "../routes";
import utility, { school } from "../../../__test__/utility";
import { sas } from "../../utils";

describe("Test Routes", () => {
  let testRequest = {
    name: "1st Test",
    marksObtainable: 20,
    parentageOfTotal: 20,
    school: school.id,
  };

  it("Can create school", async () => {
    let response = await utility.createSchool();
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ message: "Created School" });
  });

  it("Can Create Test", async () => {
    let response = await axios.post(sas(Test), testRequest);
    expect(response.status).toBe(200);
    expect(response.data.status).toEqual("success");
  });

  it("Can Fetch All Test", async () => {
    let response = await axios.get(
      sas(TestFetch.replace(":school", school.id))
    );
    expect(response.status).toBe(200);
    expect(response.data[0].name).toEqual(testRequest.name);
    expect(response.data[0].school).toEqual(testRequest.school);
  });

  it("Can Delete Test", async () => {
    let fetchTest = await axios.get(
      sas(TestFetch.replace(":school", school.id))
    );

    const config = {
      method: "delete",
      url: sas(Test),
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({
        test: fetchTest.data[0]._id,
        school: school.id,
      }),
    };

    let response = await axios(config);

    expect(response.status).toBe(200);
    expect(response.data.status).toEqual("success");
  });

  it("Can Delete School", async () => {
    let response = await utility.deleteSchool();
    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      message: `Deleted School With Name ${utility.school.name}`,
    });
  });
});
