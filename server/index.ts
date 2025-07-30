import * as fssync from "fs";
import * as fs from "fs/promises";

import { ClassName, ClassNames, SkillTreeResponse } from "@/shared/types";
import logger from "./src/lib/logger";
import setup, { Config, getMedianManifest } from "./src/serversetup";

import express, { NextFunction, Response } from "express";
import path from "path";
import DataManager from "./src/datamanager";
import { bufferTob64 } from "./src/util";

const app = express();
app.disable("x-powered-by");
app.use(express.json());

// error handling middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Express.Request, res: Response, next: NextFunction) => {
    logger.error(err.stack);
    res.status(500).send("it broken &#128511;");
});

// logging middleware
app.use((req, res, next) => {
    logger.info(`REQUEST: ${req.method}  ${req.originalUrl}`);
    next();
});

const port = parseInt(process.env.PORT ?? "");
if (!port || isNaN(port)) throw new Error("port not defined");

const createServer = async () => {
    let dataManager: DataManager;
    let config: Config;
    logger.info("Starting server...");
    try {
        const s = await setup();
        dataManager = s.dataManager;
        config = s.config;
    } catch (err: unknown) {
        logger.error(`Error during startup ${err}`);
        return;
    }

    app.get("/skilltree/:class", async (req, res) => {
        try {
            const medianmanifest = await getMedianManifest();
            if (medianmanifest && medianmanifest.tag !== config.version) {
                const s = await setup();
                dataManager = s.dataManager;
                config = s.config;
            }
        } catch (err) {
            logger.error(err);
        }

        const className = req.params.class;
        if (!ClassNames.includes(className as ClassName)) return res.status(400).send(`Invalid class must be one of: ${ClassNames.join(",")}`);

        const response: SkillTreeResponse = {
            version: config.version,
            skills: [],
            skillTabs: dataManager.getSkillTabs(className as ClassName),
        };
        const skills = dataManager.getSkills(className);
        for (const skill of skills) {
            const iconPath = skill.iconPath;
            const filename = "./" + path.join(config.imagesDir, iconPath);
            if (!fssync.existsSync(filename) || !fssync.lstatSync(filename).isFile()) {
                logger.warn(`File not found: ${filename}`);
                continue;
            }
            const img = await fs.readFile(filename);
            response.skills.push({ ...skill, b64IconBlob: bufferTob64(img) });
        }
        res.send(response);
    });

    // TODO: decide if this should be used to make individual requests smaller instead of sending skilltree data + all images in 1 response
    // full amazon skilltree right now is ~300kb including text and images which seems large
    // app.get("/images", async (req, res) => {
    //     const query = req.query;
    //     if (Object.getOwnPropertyNames(query).includes("img")) {
    //         const imgQ = query.img;
    //         if (typeof imgQ === "string") {
    //             const imagePaths = imgQ.split(",");
    //             const response: ImagesResponse = { images: [] };
    //             for (const p of imagePaths) {
    //                 if (!p || p === "") continue;
    //                 if (p.indexOf("\0") !== -1) return res.status(400).send("no &#128511;"); // poison null byte
    //                 const allowedDir = config.imagesDir + "/";
    //                 const filename = "./" + path.join(allowedDir, p);
    //                 if (filename.indexOf(allowedDir) !== 0) return res.status(400).send("NO &#128511;");  // path traversal
    //                 if (!fssync.existsSync(filename) || !fssync.lstatSync(filename).isFile()) {
    //                     logger.info(`File not found: ${filename}`);
    //                     continue;
    //                 };
    //                 const img = await fs.readFile(filename);
    //                 response.images.push({
    //                     filename: p,
    //                     b64Blob: bufferTob64(img)
    //                 });
    //             }
    //             res.status(200).send(response);
    //         } else {
    //             return res.status(400).send("Must pass query like this /images?img=a,b,c");
    //         }
    //     } else {
    //         res.status(400).send("Missing 'img' query");
    //     }
    // });

    app.listen(port, "0.0.0.0", () => logger.info("Listening..."));
};

createServer();
