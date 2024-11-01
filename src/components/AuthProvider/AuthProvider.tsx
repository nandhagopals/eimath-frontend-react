import { FC, createContext, useState } from "react";

import { type AuthContext as IAuthContext } from "components/AuthProvider/type";

import { AuthUserDetails } from "global/types";

const AuthContext = createContext<IAuthContext | null>(null);

interface Props {
  children: JSX.Element;
}

const AuthProvider: FC<Props> = ({ children }) => {
  const [authUserDetails, setAuthUserDetails] =
    useState<AuthUserDetails | null>(null);
  const isAuthenticated = !!authUserDetails?.id && authUserDetails?.id > 0;

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, authUserDetails, setAuthUserDetails }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export { AuthContext };
