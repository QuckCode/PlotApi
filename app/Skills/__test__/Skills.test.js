import axios from "axios";
import { Skill, SkillFetch } from "../routes";
import utility, { school } from "../../../__test__/utility";
import { sas } from "../../utils";

describe("Skill Routes ", () => {
  let skillRequest = {
    name: "Writing",
    school: school.id,
  };

  it("Can create school", async () => {
    let response = await utility.createSchool();
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ message: "Created School" });
  });

  it("Can Create Skill", async () => {
    let response = await axios.post(sas(Skill), skillRequest);
    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      status: "success",
      message: `Create Skill ${skillRequest.name} Successfully`,
    });
  });

  it("Can Fetch All Skill", async () => {
    let response = await axios.get(
      sas(SkillFetch.replace(":school", school.id))
    );
    expect(response.status).toBe(200);
    expect(response.data[0].name).toEqual(skillRequest.name);
    expect(response.data[0].school).toEqual(skillRequest.school);
  });

  it("Can Delete Skill", async () => {
    let fetchSkill = await axios.get(
      sas(SkillFetch.replace(":school", school.id))
    );

    const config = {
      method: "delete",
      url: sas(Skill),
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({
        skillId: fetchSkill.data[0]._id,
        school: school.id,
      }),
    };

    let response = await axios(config);

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject({
      message: `Deleted Skill With Name ${skillRequest.name}`,
    });
  });

  it("Can Delete School", async () => {
    let response = await utility.deleteSchool();
    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      message: `Deleted School With Name ${utility.school.name}`,
    });
  });
});
