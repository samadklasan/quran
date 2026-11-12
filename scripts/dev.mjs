import net from "node:net";
import { spawn } from "node:child_process";

const ports = [3000, 3001, 3002];

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => server.close(() => resolve(true)));
    server.listen(port);
  });
}

let port;
for (const candidate of ports) {
  if (await isPortAvailable(candidate)) {
    port = candidate;
    break;
  }
}

if (!port) {
  console.error(`No available port found. Tried: ${ports.join(", ")}`);
  process.exit(1);
}

console.log(`Starting Quran reader on http://localhost:${port}`);

const next = spawn("next", ["dev", "--webpack", "--port", String(port)], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

next.on("exit", (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0));
});
