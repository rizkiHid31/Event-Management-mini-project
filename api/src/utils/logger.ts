export async function writeLog({
  level,
  message,
}: {
  level: "info" | "warn" | "error";
  message: string;
  meta?: { timestamp: string };
}) {
  const timestamp = new Date().toISOString();
  const logStr = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  if (level === "error") console.error(logStr);
  else if (level === "warn") console.warn(logStr);
  else console.log(logStr);
}

export const logger = {
  info: (message: string) => writeLog({ level: "info", message }),
  warn: (message: string) => writeLog({ level: "warn", message }),
  error: (message: string) => writeLog({ level: "error", message }),
};
