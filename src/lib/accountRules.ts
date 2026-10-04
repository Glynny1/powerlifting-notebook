// Sign-up rules. The database enforces the username format too (profiles
// table check), and Supabase Auth should be set to the same password policy.

export function normalizeUsername(input: string): string {
  return input.trim().toLowerCase();
}

export function usernameProblem(username: string): string | null {
  if (username.length < 3) return "Use at least 3 characters.";
  if (username.length > 20) return "Use 20 characters or fewer.";
  if (!/^[a-z0-9_]+$/.test(username)) {
    return "Use only letters, numbers and underscores.";
  }
  return null;
}

export function emailLooksValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export const PASSWORD_MIN_LENGTH = 10;

export function passwordChecks(password: string) {
  return [
    {
      label: `At least ${PASSWORD_MIN_LENGTH} characters`,
      met: password.length >= PASSWORD_MIN_LENGTH,
    },
    { label: "A lowercase letter", met: /[a-z]/.test(password) },
    { label: "An uppercase letter", met: /[A-Z]/.test(password) },
    { label: "A number", met: /\d/.test(password) },
  ];
}
