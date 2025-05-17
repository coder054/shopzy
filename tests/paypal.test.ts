import { generateAccessToken } from "../lib/paypal";

test("generate a paypal access token", async () => {
  const tokenResponse = await generateAccessToken();
  console.log("aaa tokenResponse", tokenResponse);
  expect(typeof tokenResponse).toBe("string");
  expect(tokenResponse.length).toBeGreaterThan(1);
});
