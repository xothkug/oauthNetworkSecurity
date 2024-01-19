const axios = require("axios");
const qs = require("querystring");
const jwt = require("jsonwebtoken");

function getGoogleOAuthURL(req, res, next) {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: "https://localhost/api/oauth/google",
    client_id:
      "591413358132-nm84823j9vc27htl3h183io3ibcicrpi.apps.googleusercontent.com",
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    state: "abc",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/calendar",
    ].join(" "),
  };
  console.log({ options });
  const qs = new URLSearchParams(options);
  console.log(qs.toString());

  return res.send(`${rootUrl}?${qs.toString()}`);
}

//onetap/signin with google
async function getGoogleSignInHandler(req, res) {
  try {
    console.log("Request body: " + req.body);

    // Send a status of 200 (OK) and a JSON object with a message and the request body
    return res.status(200).json({ message: "Success", body: req.body });
  } catch (error) {
    console.log("error getting creds", error);
    // Send a status of 400 (Bad Request) and a JSON object with an error message
    return res.status(400).json({ message: "Error processing request" });
  }
}

async function getGoogleOauthHandler(req, res) {
  const code = req.query.code.toString();
  //get id and access token with the code
  const { id_token, access_token } = await getGoogleOAuthTokes({ code });
  console.log("idToken: " + id_token);
  console.log("accessToken: " + access_token);

  //get user with tokens
  const googleUser = await getGoogleUser(id_token, access_token);
  console.log(googleUser.email);

  return res.send(200).json(googleUser);
}

async function findAndUpdateUser(query, update, options) {
  return UserModel.findOneAndUpdate(query, update, options);
}

//get user with tokens
async function getGoogleUser(id_token, access_token) {
  try {
    const res = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(error, "error fetching google user");
  }
}

//Get Token for user
async function getGoogleOAuthTokes({ code }) {
  const url = "https://oauth2.googleapis.com/token";
  const values = {
    code,
    client_id:
      "591413358132-nm84823j9vc27htl3h183io3ibcicrpi.apps.googleusercontent.com",
    client_secret: "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",
    redirect_uri: "https://localhost/api/oauth/google",
    grant_type: "authorization_code",
  };
  try {
    const res = await axios.post(url, qs.stringify(values), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return res.data;
  } catch (error) {
    console.error(
      error,
      "Failed to fetch google oath token",
      error.response.data
    );
    throw error;
  }
}

module.exports = {
  getGoogleOAuthURL,
  getGoogleOauthHandler,
  getGoogleSignInHandler,
};
