const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const venvBin = path.join(__dirname, "extractor-service", ".venv", "bin", "uvicorn");
const venvWin = path.join(__dirname, "extractor-service", ".venv", "Scripts", "uvicorn.exe");
const cmd = fs.existsSync(venvBin) ? venvBin : (fs.existsSync(venvWin) ? venvWin : "uvicorn");

console.log(`[EXTRACTOR] Starting Uvicorn with binary: ${cmd}`);

const child = spawn(cmd, ["main:app", "--reload", "--port", "8001", "--host", "127.0.0.1"], {
  cwd: path.join(__dirname, "extractor-service"),
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code || 0);
});
