const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors"); // Import CORS middleware

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

let accessToken = null;
let tokenExpiryTime = null;

const fetchAccessToken = async () => {
  const tokenUrl = "https://api.spotify.com/v1/search";
  const headers = {
    Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
  const body = "grant_type=client_credentials";

  try {
    const response = await axios.post(tokenUrl, body, { headers });
    accessToken = response.data.access_token;
    tokenExpiryTime = Date.now() + response.data.expires_in * 1000;
    console.log("New access token fetched:", accessToken);
  } catch (error) {
    console.error("Error fetching access token:", error.response?.data || error.message);
  }
};

const ensureValidToken = async (req, res, next) => {
  if (!accessToken || Date.now() >= tokenExpiryTime) {
    await fetchAccessToken();
  }
  next();
};

app.get("/api/token", ensureValidToken, (req, res) => {
  res.json({ accessToken });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  fetchAccessToken();
});
