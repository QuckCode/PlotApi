import axios from "axios";
import { Subject, SubjectFetch } from "../routes";
import utility, { school } from "../../../__test__/utility";
import { sas } from "../../utils";

describe("Subjects Routes ", () => {
  let subjectRequest = {
    name: "Fuck School",
    school: school.id,
  };

  it("Can create school", async () => {
    let response = await utility.createSchool();
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ message: "Created School" });
  });

  it("Can Create Subject", async () => {
    let response = await axios.post(sas(Subject), subjectRequest);
    expect(response.status).toBe(200);
    expect(response.data.status).toEqual("success");
  });

  it("Can Fetch All Subject", async () => {
    let response = await axios.get(
      sas(SubjectFetch.replace(":school", school.id))
    );
    expect(response.status).toBe(200);
    expect(response.data[0].name).toEqual(subjectRequest.name);
    expect(response.data[0].school).toEqual(subjectRequest.school);
  });

  it("Can Delete Subject", async () => {
    let fetchSubject = await axios.get(
      sas(SubjectFetch.replace(":school", school.id))
    );

    const config = {
      method: "delete",
      url: sas(Subject),
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({
        subject: fetchSubject.data[0]._id,
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
