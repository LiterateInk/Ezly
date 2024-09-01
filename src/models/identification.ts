/**
 * can only be retrieved during `tokenize()` process
 */
export type Identification = Readonly<{
  /**
   * User's phone number most of the time.
   */
  identifier: string

  userID: string
  seed: string
  nsse: string

  // for soap
  token: string

  userPublicID: string
  // used to show the qr code
  qrCodePrivateKey: string

  // for oauth
  accessToken: string
  accessTokenExpiresIn: number
  refreshToken: string
}> & {
  sessionID: string
  refreshCount: number
};
