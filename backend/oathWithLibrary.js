const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  "591413358132-nm84823j9vc27htl3h183io3ibcicrpi.apps.googleusercontent.com",
  "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",
  "https://localhost/api/oauth/googleLibrary"
);

// generate a url that asks permissions for Blogger and Google Calendar scopes
const scopes = [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/calendar",
];

const url = oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: "offline",
  state: "abc",
  // If you only need o ne scope you can pass it as a string
  scope: scopes,
});

function getGoogleOAuthURLLibrary(req, res, next) {
  return res.send(url);
}

async function getGoogleOauthHandlerLibrary(req, res) {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send("No code found in the request");
  }
  try {
    // This will provide an object with the access_token and refresh_token.
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    console.log(tokens);
    console.log(oauth2Client);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    oauth2.userinfo.get((err, res) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log(res.data); // The user's profile information, including email and name
    });

    return res.send(200);
  } catch (error) {
    console.error("Error getting tokens:", error);
    return res.status(500).send("Error retrieving access tokens");
  }
}

module.exports = {
  getGoogleOAuthURLLibrary,
  getGoogleOauthHandlerLibrary,
};
