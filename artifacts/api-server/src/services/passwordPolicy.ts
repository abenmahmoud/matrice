const COMMON_PASSWORDS = new Set([
  "123456", "password", "123456789", "12345678", "12345", "qwerty", "abc123", "football", "monkey", "letmein",
  "111111", "1234", "1234567", "sunshine", "iloveyou", "admin", "welcome", "666666", "dragon", "passw0rd",
  "master", "hello", "freedom", "whatever", "qazwsx", "trustno1", "654321", "jordan23", "harley", "password1",
  "123123", "shadow", "superman", "michael", "ninja", "mustang", "baseball", "access", "starwars", "solo",
  "princess", "login", "adobe123", "1q2w3e4r", "zaq1zaq1", "qwertyuiop", "asdfghjkl", "zxcvbnm", "000000",
  "aa123456", "charlie", "donald", "qwerty123", "1qaz2wsx", "lovely", "flower", "hottie", "loveme", "daniel",
  "jessica", "maggie", "pepper", "buster", "tigger", "soccer", "hockey", "killer", "george", "computer",
  "michelle", "jennifer", "ginger", "summer", "corvette", "taylor", "austin", "merlin", "matrix", "matrice",
  "essuf", "braveheart", "azerty", "azertyuiop", "bonjour", "motdepasse", "motdepasse1", "jesuisadmin", "admin123",
  "1234567890", "0987654321", "00000000", "11111111", "22222222", "33333333", "44444444", "55555555", "77777777",
  "88888888", "99999999",
]);

export function validatePasswordPolicy(password: string | undefined): { ok: true } | { ok: false; error: string } {
  if (!password) return { ok: false, error: "PASSWORD_REQUIRED" };
  if (password.length < 10) return { ok: false, error: "PASSWORD_TOO_SHORT" };
  const normalized = password.toLowerCase().replace(/\s+/g, "");
  if (COMMON_PASSWORDS.has(normalized)) return { ok: false, error: "PASSWORD_TOO_COMMON" };
  return { ok: true };
}
