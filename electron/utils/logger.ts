import log from "electron-log/main";
import path from "path";

const logDir = "logs";
log.transports.file.resolvePathFn = (variables) =>
  path.join(logDir, variables.fileName || "main.log");

log.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}] {level}: {text}";
log.transports.console.format = "{text}";
log.transports.console.useStyles = false;

log.transports.file.level = "debug";
log.transports.console.level = "debug";

const errorLog = log.create({ logId: "error" });
errorLog.transports.file.resolvePathFn = () => path.join(logDir, "error.log");
errorLog.transports.file.level = "error";
errorLog.transports.console.level = false;

const combinedLog = log.create({ logId: "combined" });
combinedLog.transports.file.resolvePathFn = () =>
  path.join(logDir, "combined.log");
combinedLog.transports.console.level = false;
combinedLog.transports.file.level = "debug";

const infoLog = log.create({ logId: "info" });
infoLog.transports.file.resolvePathFn = () => path.join(logDir, "info.log");
infoLog.transports.file.level = "info";
infoLog.transports.console.level = false;

const debugLog = log.create({ logId: "debug" });
debugLog.transports.file.resolvePathFn = () => path.join(logDir, "debug.log");
debugLog.transports.file.level = "debug";
debugLog.transports.console.level = false;

const warnLog = log.create({ logId: "warn" });
warnLog.transports.file.resolvePathFn = () => path.join(logDir, "warn.log");
warnLog.transports.file.level = "warn";
warnLog.transports.console.level = false;

const colors = {
  reset: "\x1b[0m",
  error: "\x1b[31m",
  warn: "\x1b[33m",
  info: "\x1b[32m",
  debug: "\x1b[36m",
};

function formatMessage(message: any, args: any[]): string {
  let msg =
    message instanceof Error
      ? message.stack || message.message
      : String(message);

  if (args.length > 0) {
    const extras = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
      )
      .join(" ");
    msg += ` ${extras}`;
  }

  return msg;
}

export const logger = {
  error: (message: any, ...args: any[]) => {
    const text = formatMessage(message, args);
    const timestamp = new Date()
      .toISOString()
      .replace("T", " ")
      .substring(0, 19);
    const colored = `${colors.error}[${timestamp}] ERROR${colors.reset}: ${text}`;
    console.log(colored);
    errorLog.error(text);
    combinedLog.error(text);
  },

  warn: (message: any, ...args: any[]) => {
    const text = formatMessage(message, args);
    const timestamp = new Date()
      .toISOString()
      .replace("T", " ")
      .substring(0, 19);
    const colored = `${colors.warn}[${timestamp}] WARN${colors.reset}: ${text}`;
    console.log(colored);
    warnLog.warn(text);
    combinedLog.warn(text);
  },

  info: (message: any, ...args: any[]) => {
    const text = formatMessage(message, args);
    const timestamp = new Date()
      .toISOString()
      .replace("T", " ")
      .substring(0, 19);
    const colored = `${colors.info}[${timestamp}] INFO${colors.reset}: ${text}`;
    console.log(colored);
    infoLog.info(text);
    combinedLog.info(text);
  },

  debug: (message: any, ...args: any[]) => {
    const text = formatMessage(message, args);
    const timestamp = new Date()
      .toISOString()
      .replace("T", " ")
      .substring(0, 19);
    const colored = `${colors.debug}[${timestamp}] DEBUG${colors.reset}: ${text}`;
    console.log(colored);
    debugLog.debug(text);
    combinedLog.debug(text);
  },
};
