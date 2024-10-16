export function getEnvVariable(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

export function getEnvNumber(key: string, defaultValue?: number): number {
  const stringValue = getEnvVariable(key, defaultValue?.toString());
  const numberValue = Number(stringValue);
  if (Number.isNaN(numberValue)) {
    throw new Error(`Environment variable ${key} is not a valid number`);
  }
  return numberValue;
}

export function getEnvBoolean(key: string, defaultValue?: boolean): boolean {
  const stringValue = getEnvVariable(key, defaultValue?.toString());
  return stringValue.toLowerCase() === "true";
}

export function getEnvArray(key: string, defaultValue?: string): string[] {
  const value = getEnvVariable(key, defaultValue);
  return value.split(",").map((item) => item.trim());
}
