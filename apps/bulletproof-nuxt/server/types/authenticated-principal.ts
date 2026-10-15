export interface AuthenticatedPrincipal {
  id: string;
  role: "ADMIN" | "USER";
  teamId: string;
}
