import axios from "axios";
import {
  Section,
  SectionFetch,
  AddSectionBehaviour,
  SectionBehaviour,
  RemoveSectionBehaviour,
  AddSectionSkill,
  SectionSkill,
  RemoveSectionSkill,
} from "../routes";
import { Behaviour, BehaviourFetch } from "../../Behaviour/routes";
import { Skill, SkillFetch } from "../../Skills/routes";
import utility, { school } from "../../../__test__/utility";
import { sas } from "../../utils";
import faker from "faker";

describe("Section Controller Routes ", () => {
  let sectionRequest = {
    section: `${faker.commerce.department()} section`,
    school: school.id,
  };

  let behaviourRequest = {
    name: "Punctuality",
    school: school.id,
  };

  let skillRequest = {
    name: "Writing",
    school: school.id,
  };

  it("Can create school", async () => {
    let response = await utility.createSchool();
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ message: "Created School" });
  });

  it("Can create section", async () => {
    let response = await axios.post(sas(Section), sectionRequest);
    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      status: "success",
      message: "Create section successfully",
    });
  });

  it("Can fetch  all section in a school", async () => {
    let response = await axios.get(
      sas(SectionFetch.replace(":school", school.id))
    );
    expect(response.status).toBe(200);
    expect(response.data[0].section).toEqual(sectionRequest.section);
    expect(response.data[0].school).toEqual(sectionRequest.school);
    expect(response.data[0].behaviors).toEqual([]);
    expect(response.data[0].skills).toEqual([]);
  });

  // Section behaviour Test

  describe("Section Behaviour", () => {
    it("Can create behaviour", async () => {
      let response = await axios.post(sas(Behaviour), behaviourRequest);
      expect(response.status).toBe(200);
    });

    it("Can add behaviour  to section", async () => {
      let fetchSectionResponse = await axios.get(
        sas(SectionFetch.replace(":school", school.id))
      );

      let behaviorResponse = await axios.get(
        sas(BehaviourFetch.replace(":school", school.id))
      );
      expect(behaviorResponse.status).toBe(200);
      expect(fetchSectionResponse.status).toBe(200);
      expect(fetchSectionResponse.data[0].section).toEqual(
        sectionRequest.section
      );
      expect(behaviorResponse.data[0].name).toEqual(behaviourRequest.name);

      let postBehavior = await axios.post(sas(AddSectionBehaviour), {
        sectionId: fetchSectionResponse.data[0]._id,
        behaviour: [behaviorResponse.data[0]._id],
      });
      expect(postBehavior.status).toBe(200);
      expect(postBehavior.data).toMatchObject({
        title: "success",
        message: "Added Behaviour from Section",
      });
    });

    it("Can fetch behaviour from section", async () => {
      let fetchSectionResponse = await axios.get(
        sas(SectionFetch.replace(":school", school.id))
      );
      expect(fetchSectionResponse.status).toBe(200);

      let fetchSectionBehaviour = await axios.get(
        sas(
          SectionBehaviour.replace(
            ":sectionId",
            fetchSectionResponse.data[0]._id
          )
        )
      );
      expect(fetchSectionBehaviour.status).toBe(200);
      expect(fetchSectionBehaviour.data[0].name).toBe(behaviourRequest.name);
    });

    it("Can remove behaviour from section", async () => {
      let fetchSectionResponse = await axios.get(
        sas(SectionFetch.replace(":school", school.id))
      );
      let fetchSectionBehaviour = await axios.get(
        sas(
          SectionBehaviour.replace(
            ":sectionId",
            fetchSectionResponse.data[0]._id
          )
        )
      );

      expect(fetchSectionResponse.status).toBe(200);
      expect(fetchSectionBehaviour.status).toBe(200);
      let removeBehavior = await axios.post(sas(RemoveSectionBehaviour), {
        sectionId: fetchSectionResponse.data[0]._id,
        behaviour: [fetchSectionBehaviour.data[0]._id],
      });
      expect(removeBehavior.status).toBe(200);
      expect(removeBehavior.data).toMatchObject({
        title: "success",
        message: "Removed Behaviors from Section",
      });
    });
  });

  ///Section Skills
  describe("Section Skills", () => {
    it("Can create skill", async () => {
      //Crate skill
      let response = await axios.post(sas(Skill), skillRequest);
      expect(response.status).toBe(200);
      expect(response.data).toEqual({
        status: "success",
        message: `Create Skill ${skillRequest.name} Successfully`,
      });
    });

    // add skill to section
    it("Can add skill  to section", async () => {
      let fetchSectionResponse = await axios.get(
        sas(SectionFetch.replace(":school", school.id))
      );

      let skillResponse = await axios.get(
        sas(SkillFetch.replace(":school", school.id))
      );
      expect(skillResponse.status).toBe(200);
      expect(fetchSectionResponse.status).toBe(200);
      expect(fetchSectionResponse.data[0].section).toEqual(
        sectionRequest.section
      );
      expect(skillResponse.data[0].name).toEqual(skillRequest.name);

      let postSkill = await axios.post(sas(AddSectionSkill), {
        sectionId: fetchSectionResponse.data[0]._id,
        skills: [skillResponse.data[0]._id],
      });
      expect(postSkill.status).toBe(200);
      expect(postSkill.data).toMatchObject({
        title: "success",
        message: "Added Skills from Section",
      });
    });

    it("Can fetch skill from section", async () => {
      let fetchSectionResponse = await axios.get(
        sas(SectionFetch.replace(":school", school.id))
      );
      const { _id } = fetchSectionResponse.data[0];
      let fetchSectionSkill = await axios.get(
        sas(SectionSkill.replace(":sectionId", _id))
      );
      expect(fetchSectionResponse.status).toBe(200);
      expect(fetchSectionSkill.status).toBe(200);
      expect(fetchSectionSkill.data[0].name).toBe(skillRequest.name);
    });

    it("Can remove skill from section", async () => {
      let fetchSectionResponse = await axios.get(
        sas(SectionFetch.replace(":school", school.id))
      );
      let fetchSectionSkills = await axios.get(
        sas(
          SectionSkill.replace(":sectionId", fetchSectionResponse.data[0]._id)
        )
      );
      let removeSkill = await axios.post(sas(RemoveSectionSkill), {
        sectionId: fetchSectionResponse.data[0]._id,
        skills: [fetchSectionSkills.data[0]._id],
      });
      expect(removeSkill.status).toBe(200);
      expect(removeSkill.data).toMatchObject({
        title: "success",
        message: "Removed Skills from Section",
      });
    });
  });

  it("Can Delete Section", async () => {
    let sectionResponse = await axios.get(
      sas(SectionFetch.replace(":school", school.id))
    );
    expect(sectionResponse.status).toBe(200);

    const { section } = sectionResponse.data[0];
    const data = JSON.stringify({ sectionId: sectionResponse.data[0]._id });
    const config = {
      method: "delete",
      url: sas(Section),
      headers: { "Content-Type": "application/json" },
      data,
    };

    let response = await axios(config);
    expect(response.status).toBe(200);
    expect(response.data).toMatchObject({
      title: "success",
      message: `Deleted ${section} Section  `,
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
