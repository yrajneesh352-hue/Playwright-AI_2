import { readTestData } from "./DataReader";

interface LoginScenario {
  email: string;
  password: string;
  expected: "success" | "failure";
}

export function getValidLoginCredentials(): Pick<LoginScenario, "email" | "password"> {
  const scenario = readTestData<LoginScenario>("testdata/opencart_logindata.json").find(
    (candidate) => candidate.expected === "success",
  );

  if (
    !scenario ||
    typeof scenario.email !== "string" ||
    !scenario.email.trim() ||
    typeof scenario.password !== "string" ||
    !scenario.password.trim()
  ) {
    throw new Error("Login test data must include a successful scenario with credentials.");
  }

  return {
    email: scenario.email.trim(),
    password: scenario.password.trim(),
  };
}
