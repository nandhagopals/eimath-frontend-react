import { jwtDecode } from "jwt-decode";
import { z } from "zod";

export const jwtDecodedSchema = z.object({
  id: z.number(),
  type: z.union([
    z.literal("None"),
    z.literal("User"),
    z.literal("MF"),
    z.literal("Franchisee"),
  ]),
  iat: z.number(),
  nbf: z.number(),
  exp: z.number(),
  // userHash: z.string(),
});

export type JWTDecoded = z.infer<typeof jwtDecodedSchema>;

export const isAuthorizedUser = () => {
  const token: string | null = localStorage.getItem("token");

  if (token && token?.length > 100)
    try {
      if (jwtDecode<JWTDecoded>(token)?.id) {
        return jwtDecode<JWTDecoded>(token);
      } else {
        return null;
      }
    } catch {
      return null;
    }
  else {
    return null;
  }
};
