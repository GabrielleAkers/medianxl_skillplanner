import * as winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
const { printf, combine, timestamp, errors, prettyPrint, splat } = winston.format;

const customFormat = printf(({ timestamp, level, message, ...rest }) => {
    let restString = JSON.stringify(rest, undefined, 2);
    restString = restString === '{}' ? '' : restString;

    return `[${timestamp}] ${level}: ${JSON.stringify(message)} ${restString}`;
});

const format = combine(errors({ stack: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat);

const rotateTransport = new DailyRotateFile({
    filename: "logs/median-skillplanner-%DATE%.log",
    datePattern: "YYYY-MM-DD-HH",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "2d",
    format: format,
    handleExceptions: true,
    handleRejections: true
});

rotateTransport.on("error", err => {
    console.error(err);
});

const logger = winston.createLogger({
    level: "info",
    exitOnError: false,
    transports: [
        rotateTransport
    ]
});

if (process.env.NODE_END !== "production") {
    logger.add(new winston.transports.Console({
        format: combine(splat(), prettyPrint())
    }));
}

export default logger;