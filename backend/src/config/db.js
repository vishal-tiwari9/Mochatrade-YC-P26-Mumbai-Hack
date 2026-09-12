const mongoose = require("mongoose");
const { execFileSync } = require("child_process");

/**
 * Resolves MongoDB Atlas SRV and TXT records on Windows when Node c-ares DNS resolver fails
 */
function resolveSrvFallback(srvUri) {
  try {
    const match = srvUri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?#]+)(.*)$/);
    if (!match) return null;

    const [, user, pass, clusterHost, rest] = match;
    const srvCmd = `(Resolve-DnsName -Name _mongodb._tcp.${clusterHost} -Type SRV -ErrorAction Stop).NameTarget`;
    const txtCmd = `(Resolve-DnsName -Name ${clusterHost} -Type TXT -ErrorAction Stop).Strings`;

    const shardTargets = execFileSync("powershell.exe", ["-NoProfile", "-Command", srvCmd])
      .toString()
      .trim()
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => (s.includes(":") ? s : `${s}:27017`));

    if (!shardTargets.length) return null;

    let txtParams = "ssl=true&authSource=admin&retryWrites=true&w=majority";
    try {
      const txtStrings = execFileSync("powershell.exe", ["-NoProfile", "-Command", txtCmd])
        .toString()
        .trim();
      if (txtStrings.includes("replicaSet=")) {
        txtParams = `ssl=true&${txtStrings}`;
      }
    } catch {
      // Use standard default if TXT fails
    }

    const pathAndQuery = rest.startsWith("/") ? rest : `/${rest}`;
    const cleanPath = pathAndQuery.split("?")[0] || "/nbfc_credit_db";
    const connector = cleanPath.includes("?") ? "&" : "?";

    return `mongodb://${user}:${pass}@${shardTargets.join(",")}${cleanPath}${connector}${txtParams}`;
  } catch (err) {
    return null;
  }
}

let memoryServer = null;

/**
 * Connects to MongoDB Atlas using MONGO_URI from environment variables,
 * with automatic In-Memory MongoDB fallback if Atlas is unreachable or IP is not whitelisted.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (uri) {
    try {
      console.log("   Attempting connection to MongoDB Atlas...");
      await mongoose.connect(uri, {
        dbName: "nbfc_credit_db",
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ MongoDB Atlas connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
      return mongoose.connection;
    } catch (err) {
      console.log(`   ⚠️ Direct MongoDB Atlas connection failed (${err.message.split("\n")[0]}).`);
      
      if (uri.startsWith("mongodb+srv://")) {
        console.log("   Attempting system DNS resolution fallback for Atlas...");
        const directUri = resolveSrvFallback(uri);
        if (directUri) {
          try {
            await mongoose.connect(directUri, {
              dbName: "nbfc_credit_db",
              serverSelectionTimeoutMS: 5000,
            });
            console.log(`✅ MongoDB Atlas connected via direct hosts: ${mongoose.connection.host}`);
            return mongoose.connection;
          } catch (fallbackErr) {
            console.log(`   ⚠️ Direct host Atlas connection failed (${fallbackErr.message.split("\n")[0]}).`);
          }
        }
      }
    }
  }

  // Automatic In-Memory MongoDB Fallback
  try {
    console.log("   ⚡ Starting In-Memory MongoDB instance (Local Fast Mode)...");
    const { MongoMemoryServer } = require("mongodb-memory-server");
    memoryServer = await MongoMemoryServer.create({
      binary: {
        version: "7.0.14",
      },
    });
    const memUri = memoryServer.getUri();
    await mongoose.connect(memUri, {
      dbName: "nbfc_credit_db",
    });
    console.log(`✅ In-Memory MongoDB connected successfully (${memUri})`);
    console.log("   ℹ️ Tip: To use MongoDB Atlas, whitelist your IP in Atlas Network Access or add 0.0.0.0/0.");
    return mongoose.connection;
  } catch (memErr) {
    console.error("❌ Failed to start In-Memory MongoDB fallback:", memErr.message);
    throw memErr;
  }
}

module.exports = connectDB;

