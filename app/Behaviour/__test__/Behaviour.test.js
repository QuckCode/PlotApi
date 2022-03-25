import axios from "axios";
import { Behaviour, BehaviourFetch } from "../routes";
import utility, { school } from "../../../__test__/utility";
import { sas } from "../../utils";

describe("Behaviour Routes", () => {
  let behaviourRequest = {
    name: "Punctuality",
    school: school.id,
  };

  it("Can create school", async () => {
    let response = await utility.createSchool();
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ message: "Created School" });
  });

  it("Can Create Behaviour", async () => {
    let response = await axios.post(sas(Behaviour), behaviourRequest);
    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      status: "Success",
      message: `Create Behaviour ${behaviourRequest.name} Successfully `,
    });
  });

  it("Can Fetch All Behaviour", async () => {
    let response = await axios.get(
      sas(BehaviourFetch.replace(":school", school.id))
    );
    expect(response.status).toBe(200);
    expect(response.data[0].name).toEqual(behaviourRequest.name);
    expect(response.data[0].school).toEqual(behaviourRequest.school);
  });

  it("Can Delete Behaviour", async () => {
    let fetchBehaviour = await axios.get(
      sas(BehaviourFetch.replace(":school", school.id))
    );

    const config = {
      method: "delete",
      url: sas(Behaviour),
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({
        behaviourId: fetchBehaviour.data[0]._id,
        school: school.id,
      }),
    };

    let response = await axios(config);

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject({
      message: `Deleted Behaviour With Name ${behaviourRequest.name}`,
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
