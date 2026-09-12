require("dotenv").config();

function validateEnv() {
  const missing = [];
  if (!process.env.MONGO_URI) missing.push("MONGO_URI");
  if (!process.env.JWT_SECRET) missing.push("JWT_SECRET");

  if (missing.length > 0) {
    console.error("\n=======================================================");
    console.error("❌ [CONFIG ERROR] Missing required environment variable(s):");
    missing.forEach((v) => console.error(`   - ${v}`));
    console.error("\nPlease check your backend/.env file (see .env.example).");
    console.error("=======================================================\n");
    process.exit(1);
  }

  const PORT = parseInt(process.env.PORT || "5001", 10);
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";
  const NODE_ENV = process.env.NODE_ENV || "development";
  const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8001";

  return {
    PORT,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN,
    NODE_ENV,
    ML_SERVICE_URL,
  };
}

module.exports = { validateEnv, env: validateEnv() };
