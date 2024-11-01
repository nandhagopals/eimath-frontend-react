import { SetState, AuthUserDetails } from "global/types";

interface AuthContext {
  isAuthenticated: boolean;
  authUserDetails: AuthUserDetails | null;
  setAuthUserDetails: SetState<AuthUserDetails | null>;
}

export type { AuthContext };
