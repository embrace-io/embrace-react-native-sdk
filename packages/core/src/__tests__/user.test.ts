import {
  addUserPersona,
  clearAllUserPersonas,
  clearUserEmail,
  clearUserIdentifier,
  clearUsername,
  clearUserPersona,
  setUserEmail,
  setUserIdentifier,
  setUsername,
} from "../api/user";

jest.useFakeTimers();

const mockSetUserIdentifier = jest.fn().mockReturnValue(Promise.resolve(true));
const mockClearUserIdentifier = jest
  .fn()
  .mockReturnValue(Promise.resolve(true));
const mockSetUsername = jest.fn().mockReturnValue(Promise.resolve(true));
const mockClearUsername = jest.fn().mockReturnValue(Promise.resolve(true));
const mockSetUserEmail = jest.fn().mockReturnValue(Promise.resolve(true));
const mockClearUserEmail = jest.fn().mockReturnValue(Promise.resolve(true));
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
    setUsername: (username: string) => mockSetUsername(username),
    clearUsername: () => mockClearUsername(),
    setUserEmail: (userEmail: string) => mockSetUserEmail(userEmail),
    clearUserEmail: () => mockClearUserEmail(),
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

describe("User Data Tests", () => {
  const testUserId = "testUser";
  const testEmail = "test@test.com";

  test("setUsername", async () => {
    await setUsername(testUserId);
    expect(mockSetUsername).toHaveBeenCalledWith(testUserId);
  });

  test("clearUsername", async () => {
    await clearUsername();
    expect(mockClearUsername).toHaveBeenCalled();
  });

  test("setUserEmail", async () => {
    await setUserEmail(testEmail);
    expect(mockSetUserEmail).toHaveBeenCalledWith(testEmail);
  });

  test("clearUserEmail", async () => {
    await clearUserEmail();
    expect(mockClearUserEmail).toHaveBeenCalled();
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
