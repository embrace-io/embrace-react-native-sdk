import {
  addUserPersona,
  clearAllUserPersonas,
  clearUserIdentifier,
  clearUserPersona,
  setUserIdentifier,
} from "../api/user";

jest.useFakeTimers();

const mockSetUserIdentifier = jest.fn().mockReturnValue(Promise.resolve(true));
const mockClearUserIdentifier = jest
  .fn()
  .mockReturnValue(Promise.resolve(true));
const mockAddUserPersona = jest.fn().mockReturnValue(Promise.resolve(true));
const mockClearUserPersona = jest.fn().mockReturnValue(Promise.resolve(true));
const mockClearAllUserPersonas = jest
  .fn()
  .mockReturnValue(Promise.resolve(true));

jest.mock("../EmbraceManagerModule", () => ({
  EmbraceManagerModule: {
    setUserIdentifier: (userIdentifier: string) =>
      mockSetUserIdentifier(userIdentifier),
    clearUserIdentifier: () => mockClearUserIdentifier(),
    addUserPersona: (persona: string) => mockAddUserPersona(persona),
    clearUserPersona: (persona: string) => mockClearUserPersona(persona),
    clearAllUserPersonas: () => mockClearAllUserPersonas(),
  },
}));

describe("User Identifier Tests", () => {
  const testUserId = "testUser";
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("setUserIdentifier", async () => {
    await setUserIdentifier(testUserId);
    expect(mockSetUserIdentifier).toHaveBeenCalledWith(testUserId);
  });

  test("clearUserIdentifier", async () => {
    await clearUserIdentifier();
    expect(mockClearUserIdentifier).toHaveBeenCalled();
  });
});

describe("Personas Tests", () => {
  const testPersona = "Persona";

  test("addUserPersona", async () => {
    await addUserPersona(testPersona);
    expect(mockAddUserPersona).toHaveBeenCalledWith(testPersona);
  });

  test("clearUserPersona", async () => {
    await clearUserPersona(testPersona);
    expect(mockClearUserPersona).toHaveBeenCalledWith(testPersona);
  });

  test("clearAllUserPersonas", async () => {
    await clearAllUserPersonas();
    expect(mockClearAllUserPersonas).toHaveBeenCalled();
  });
});
