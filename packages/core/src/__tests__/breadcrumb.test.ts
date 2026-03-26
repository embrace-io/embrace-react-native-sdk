import {addBreadcrumb} from "../api/breadcrumb";

const mockAddBreadcrumb = jest.fn();

jest.mock("../EmbraceManagerModule", () => ({
  EmbraceManagerModule: {
    addBreadcrumb: (message: string) => {
      mockAddBreadcrumb(message);
      return Promise.resolve(true);
    },
  },
}));

const MOCK_VIEW = "View";

describe("breadcrumbs", () => {
  test("addBreadcrumb", async () => {
    await addBreadcrumb(MOCK_VIEW);
    expect(mockAddBreadcrumb).toHaveBeenCalledWith(MOCK_VIEW);
  });
});
