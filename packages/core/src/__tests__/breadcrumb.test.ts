import {addBreadcrumb, logScreen} from "../api/breadcrumb";

const mockAddBreadcrumb = jest.fn();

jest.mock("../EmbraceManagerModule", () => ({
  EmbraceManagerModule: {
    addBreadcrumb: (message: string) => mockAddBreadcrumb(message),
  },
}));

const MOCK_VIEW = "View";

describe("breadcrumbs", () => {
  test("addBreadcrumb", async () => {
    await addBreadcrumb(MOCK_VIEW);
    expect(mockAddBreadcrumb).toHaveBeenCalledWith(MOCK_VIEW);
  });

  test("logScreen", async () => {
    await logScreen(MOCK_VIEW);
    expect(mockAddBreadcrumb).toHaveBeenCalledWith(
      `Opening screen [${MOCK_VIEW}]`,
    );
  });
});
