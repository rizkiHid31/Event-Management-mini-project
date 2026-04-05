import path from "node:path";
import fs from "node:fs/promises";

export async function writeLog({
  level,
  message,
}: {
  level: "info" | "warn" | "error";
  message: string;
  meta?: { timestamp: string };
}) {
  const log = { level, message, meta: { timestamp: new Date().toISOString() } };
  const logStr = JSON.stringify(log, null, 2);

  // Always print to console (visible in Railway logs)
  if (level === "error") console.error(logStr);
  else if (level === "warn") console.warn(logStr);
  else console.log(logStr);

  // Write to files only if not in production (Railway filesystem is ephemeral)
  if (process.env["NODE_ENV"] === "production") return;

  const logDir = path.join(process.cwd(), "logger");
  await fs.mkdir(logDir, { recursive: true });

  const combinedLogPath = path.join(logDir, "combined.log");
  const errorLogPath = path.join(logDir, "error.log");
  const warnLogPath = path.join(logDir, "warn.log");
  const infoLogPath = path.join(logDir, "info.log");

  await fs.appendFile(combinedLogPath, logStr);
  if (level === "error") await fs.appendFile(errorLogPath, logStr);
  if (level === "warn") await fs.appendFile(warnLogPath, logStr);
  if (level === "info") await fs.appendFile(infoLogPath, logStr);
}

export const logger = {
  info: (message: string) => writeLog({ level: "info", message }),
  warn: (message: string) => writeLog({ level: "warn", message }),
  error: (message: string) => writeLog({ level: "error", message }),
};
