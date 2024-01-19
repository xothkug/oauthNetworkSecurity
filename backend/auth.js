const bcrypt = require("bcrypt");
const pool = require("./database");
const jwt = require("jsonwebtoken");
module.exports = (app) => {
  const cookieParser = require("cookie-parser");
  app.use(cookieParser());
};

function authenticateToken(req, res, next) {
  const token = req.cookies.token;

  if (token == null) {
    return res.sendStatus(401); // Geen token, ongeautoriseerd
  }

  jwt.verify(token, "jM%2y#VWB44#jC3#^", (err, user) => {
    if (err) {
      return res.sendStatus(403); // Token niet geldig of verlopen
    }

    req.user = user;
    return res.sendStatus(200);
    //next(); // Ga door naar de volgende middleware/route handler
  });
}

async function register(req, res) {
  try {
    const { email, password } = req.body; // Verander 'username' in 'email'
    const hashedPassword = await bcrypt.hash(password, 10);

    const [rows] = await pool.query(
      "INSERT INTO users (email, hashed_password) VALUES (?, ?)", // Verander 'username' in 'email' in de database query
      [email, hashedPassword]
    );

    res.status(201).json({ message: "Gebruiker geregistreerd" });
  } catch (error) {
    console.error("Registratiefout:", error);
    res.status(500).json({ message: "Fout bij registratie" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(401).json({ message: "Onjuiste inloggegevens." });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.hashed_password);

    if (!validPassword) {
      return res.status(401).json({ message: "Onjuiste inloggegevens." });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      "jM%2y#VWB44#jC3#^", // Gebruik een sterke geheime sleutel, bewaar deze veilig!
      { expiresIn: "1h" } // Token verloopt na 1 uur
    );

    res.cookie("token", token, {
      httpOnly: true, // De cookie is niet toegankelijk via client-side scripts
      secure: true, // Verzend alleen over HTTPS
      maxAge: 3600000, // Stel dezelfde vervaltijd in als de JWT
    });

    res.status(200).json({ message: "Login succesvol!" });
  } catch (error) {
    console.error("Loginfout:", error);
    res.status(500).json({ message: "Fout bij inloggen" });
  }
}

module.exports = {
  register,
  login,
  authenticateToken,
};
