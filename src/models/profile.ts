export type Profile = Readonly<{
  firstName: string
  lastName: string
  email: string
  /** an alias identifier */
  identifier: string
}>;
