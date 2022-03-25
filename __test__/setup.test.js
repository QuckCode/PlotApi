import axios from "axios";

describe("Initial Test", () => {
  it("The server started at http://localhost:4000/ ", async () => {
    expect(await (await axios.get("http://localhost:4000/")).status).toBe(200);
  });
});
