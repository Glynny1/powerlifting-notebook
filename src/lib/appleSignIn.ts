import { signInWithProvider } from "./auth";

// Android and web have no native Apple sign-in, so use the browser flow
export function signInWithApple() {
  return signInWithProvider("apple");
}
