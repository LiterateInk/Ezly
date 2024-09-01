export class ReauthenticateError extends Error {
  constructor() {
    super("You have to re-authenticate to perform this action");
    this.name = "ReauthenticateError";
  }
}
