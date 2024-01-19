const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const port = 3000;
const { register, login, authenticateToken } = require("./auth");
const useMySQL = process.env.STORAGE && process.env.STORAGE === "mysql";

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Middleware for logging requests
app.use((req, res, next) => {
  console.log(req.method + " " + req.url);
  next();
});

// Auth routes
app.post("/api/register", register);
app.post("/api/login", login);
app.get("/api/auth", authenticateToken);

// OAuth routes
const oauthHandlers = require("./oauth.js");
app.get("/api/oauth/getUrl", oauthHandlers.getGoogleOAuthURL);
app.get("/api/oauth/google", oauthHandlers.getGoogleOauthHandler);
app.post("/api/oauth/google", oauthHandlers.getGoogleSignInHandler);

const oauthHandlersLibrary = require("./oathWithLibrary.js");
app.get(
  "/api/oauth/getUrlLibrary",
  oauthHandlersLibrary.getGoogleOAuthURLLibrary
);
app.get(
  "/api/oauth/googleLibrary",
  oauthHandlersLibrary.getGoogleOauthHandlerLibrary
);

// Start the server
app.listen(port, () => {
  console.log(`Todo API listening on port ${port}`);
});
