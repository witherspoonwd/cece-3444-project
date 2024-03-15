export const ironOptions = {
    cookieName: "MY_APP_COOKIE",
    password: "RP8JZsrGnVtsVW2n8kRtUrSH7WsG2Qcr",
    // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
    cookieOptions: {
        secure: process.env.NODE_ENV === "production" ? true: false,
  },
}