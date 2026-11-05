import Wizard from "../util/wizard";

describe("Wizard", () => {
  test("fieldValueList asks for a field left empty only once", async () => {
    const field = {
      name: "iOS directory Name",
      fetch: jest.fn().mockResolvedValue(""),
    };
    const wizard = new Wizard();

    expect(await wizard.fieldValueList([field])).toEqual([""]);
    expect(await wizard.fieldValueList([field])).toEqual([""]);
    expect(field.fetch).toHaveBeenCalledTimes(1);
  });
});
