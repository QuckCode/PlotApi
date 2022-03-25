import axios from "axios";
import {
  GenerateScratchCard,
  GetScratchCard,
  UseScratchCard,
  DeleteCard,
  GetUsedScratchCard,
  StatsScratchCard,
} from "../routes";
import utility, { school } from "../../../__test__/utility";
import { sas } from "../../utils";

describe("Scratch Card Routes ", () => {
  let pinRequest = {
    amount: 2000,
    numberOfCard: 1,
    school: utility.school.id,
  };

  it("Can Create School", async () => {
    let response = await utility.createSchool();
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ message: "Created School" });
  });

  it("Can Generate Pins", async () => {
    let response = await axios.post(sas(GenerateScratchCard), pinRequest);
    expect(response.status).toBe(200);
    expect(response.data.title).toEqual("success");
  });

  it("Can Fetch Created Pin", async () => {
    let response = await axios.get(
      sas(GetScratchCard.replace(":school", school.id))
    );
    expect(response.status).toBe(200);
    expect(response.data.length).toEqual(1);
  });

  it("Can Use Scratch Card", async () => {
    let fetchScratchCard = await axios.get(
      sas(GetScratchCard.replace(":school", school.id))
    );
    expect(fetchScratchCard.status).toBe(200);
    expect(fetchScratchCard.data.length >= 1).toEqual(true);

    let useCardResponse = await axios.post(sas(UseScratchCard), {
      pin: fetchScratchCard.data[0].pin,
      school: school.id,
    });
    expect(useCardResponse.status).toBe(200);
  });

  it("Can Fetch All Use Scratch Card", async () => {
    let fetchUsedScratchCard = await axios.get(
      sas(GetUsedScratchCard.replace(":school", school.id))
    );
    expect(fetchUsedScratchCard.status).toBe(200);
    expect(fetchUsedScratchCard.data.length >= 1).toEqual(true);
    expect(fetchUsedScratchCard.data[0].used).toEqual(true);
  });

  it("Can Fetch Stats For Scratch Cards", async () => {
    let response = await axios.get(
      sas(StatsScratchCard.replace(":school", school.id))
    );
    expect(response.status).toBe(200);
    expect(response.data.totalScratchCard).toEqual(1);
    expect(response.data.totalUsedScratchCard).toEqual(1);
    expect(response.data.totalNotUsedScratchCard).toEqual(0);
  });

  it("Can Delete Used Scratch Card", async () => {
    let fetchScratchCard = await axios.get(
      sas(GetScratchCard.replace(":school", utility.school.id))
    );
    expect(fetchScratchCard.status).toBe(200);
    expect(fetchScratchCard.data.length >= 1).toEqual(true);
    let deleteCardResponse = await axios.delete(
      sas(
        DeleteCard.replace(
          ":serialNumber",
          fetchScratchCard.data[0].serialNumber
        )
      )
    );
    expect(deleteCardResponse.status).toBe(200);
    expect(deleteCardResponse.status).toBe(200);
    expect(deleteCardResponse.status).toBe(200);
  });

  it("Can Delete School", async () => {
    let response = await utility.deleteSchool();
    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      message: `Deleted School With Name ${utility.school.name}`,
    });
  });
});
