import child_process from "child_process";
import * as fs from "fs/promises";
import * as fssync from "fs";
import * as path from "path";
import util from "util";

import DataManager from "./datamanager";
import logger from "./lib/logger";
import MpqFile from "./lib/mpqfile";
import type MedianManifest from "./medianmanifest";
import { ClassNames } from "@/shared/types";

const exec = util.promisify(child_process.exec);

const createConfig = (version: string) => {
    const o = {
        version: version,
        mpqDir: `./mxl/${version}`,
        extractedMpqDataDir: "./mpqdata",
        dc6ParserExecPath: "./external/qdc6",
        binPath: "",
        tblPath: "",
        dc6Path: "",
        classNames: ClassNames,
        usedFiles: [] as string[],
        imagesDir: `./images/${version}`
    }
    o.binPath = `data/global/excel`;
    o.tblPath = `data/local/lng/eng`;
    o.dc6Path = `data/global/themes/classic_sigma/game/skills`;
    o.usedFiles = [
        `${o.binPath}/skills.bin`,
        `${o.binPath}/skilldesc.bin`,
        `${o.binPath}/skilltabs.bin`,
        `${o.dc6Path}/socket.dc6`,
        `${o.dc6Path}/tree-tabs.dc6`,
        `${o.tblPath}/patchstring.tbl`,
        `${o.tblPath}/expansionstring.tbl`,
        `${o.tblPath}/string.tbl`
    ];
    for (const c of o.classNames) {
        o.usedFiles.push(`${o.dc6Path}/layout-${c}.dc6`);
        o.usedFiles.push(`${o.dc6Path}/icons-${c}.dc6`)
    }
    return o;
}

export type Config = ReturnType<typeof createConfig>;

const extractImg = async (dc6ParserExecPath: string, imPath: string, outPath: string) => {
    await fs.mkdir(outPath, { recursive: true });
    logger.info(`Extracting images: ${imPath} to: ${outPath}`);
    const { stderr } = await exec(`${dc6ParserExecPath} -o ${outPath} ${imPath}`);
    if (stderr) logger.error(stderr);
}

const loadDc6 = async (dc6ParserExecPath: string, dc6Path: string, imagesDir: string, classNames: ClassNames) => {
    for (const className of classNames) {
        const outPath = `${imagesDir}/${className}`;
        await extractImg(dc6ParserExecPath, `${dc6Path}/icons-${className}.dc6`, outPath);
        await extractImg(dc6ParserExecPath, `${dc6Path}/layout-${className}.dc6`, outPath);
    }

    let outPath = `${imagesDir}/tree-tabs`;
    await extractImg(dc6ParserExecPath, `${dc6Path}/tree-tabs.dc6`, outPath);

    outPath = `${imagesDir}/socket`;
    await extractImg(dc6ParserExecPath, `${dc6Path}/socket.dc6`, outPath);
}

const collectMpqs = async (dir: string) => {
    const mpqs: string[] = [];
    for await (const p of fs.glob(`${dir}/medianxl-*.mpq`)) mpqs.push(p);
    return mpqs;
}

const extractPathsFromMpqs = async (extractedMpqDataDir: string, mpqs: string[], paths: string[]) => {
    for (const mpqPath of mpqs) {
        const mpqfile = await MpqFile.open(mpqPath);
        for (const p of paths) {
            const f = await mpqfile.extract(p);
            if (f !== null) {
                await fs.mkdir(path.dirname(`${extractedMpqDataDir}/${p}`), {recursive: true});
                await fs.writeFile(`${extractedMpqDataDir}/${p}`, f);
            }
        }
        mpqfile.close();
    }
}

const getMedianManifest = async (): Promise<MedianManifest | null> => {
    const res = await fetch("https://launcher.median-xl.com/mxl/release/public/manifest");
    if (!res.ok) {
        logger.error(`Unable to fetch median manifest, code: ${res.status}, status: ${res.statusText}`);
        return null;
    }
    return await res.json();
}

const checkForUpdate = async (manifestsDir: string) => {
    const manifest = await getMedianManifest();
    let needsUpdate = false;
    if (manifest !== null) {
        await fs.mkdir(manifestsDir, {recursive: true});
        if (fssync.existsSync(`${manifestsDir}/latest`)) {
            const latest: MedianManifest = JSON.parse(await fs.readFile(`${manifestsDir}/latest`, "utf-8"));
            if (latest.tag !== manifest.tag) {
                await fs.writeFile(`${manifestsDir}/latest`, JSON.stringify(manifest));
                needsUpdate = true;
            }
        } else {
            await fs.writeFile(`${manifestsDir}/latest`, JSON.stringify(manifest));
            needsUpdate = true;
        }
        await fs.writeFile(`${manifestsDir}/${manifest.tag}`, JSON.stringify(manifest));
    }
    return needsUpdate;
}

const getLatestManifest = async (manifestsDir: string) => {
    const latest: MedianManifest = JSON.parse(await fs.readFile(`${manifestsDir}/latest`, "utf-8"));
    return latest;
}

const downloadMedianFiles = async (manifest: MedianManifest, outDir: string) => {
    for (const entry of manifest.files) {
        if (!entry.name.endsWith(".mpq")) continue;
        logger.info(`Downloading: ${entry.name}`);
        const res = await fetch(entry.url);
        if (!res.ok) {
            logger.warn(`Failed to download ${entry.name}`);
            continue;
        }
        const data = await res.bytes();
        await fs.mkdir(outDir, {recursive: true});
        await fs.writeFile(`${outDir}/${entry.name}`, data);
    }
}

const setup = async () => {
    logger.info("Checking for updates...");
    const manifestsDir = "./manifests";
    const needsUpdate = await checkForUpdate(manifestsDir);
    const latestManifest = await getLatestManifest(manifestsDir);
    const config = createConfig(latestManifest.tag);

    if (needsUpdate) {
        logger.info(`New median version found: ${latestManifest.tag}, downloading files...`);
        await downloadMedianFiles(latestManifest, config.mpqDir);
    } else logger.info("No update needed");


    logger.info("Extracting data from mpqs");
    const mpqs = await collectMpqs(config.mpqDir);
    await extractPathsFromMpqs(config.extractedMpqDataDir, mpqs, config.usedFiles);

    logger.info("Parsing images");
    await loadDc6(config.dc6ParserExecPath, `${config.extractedMpqDataDir}/${config.dc6Path}`, config.imagesDir, config.classNames);

    logger.info("Initializing data manager");
    const dataManager = await DataManager.init(`${config.extractedMpqDataDir}/${config.binPath}`, `${config.extractedMpqDataDir}/${config.tblPath}`);

    return { dataManager, config };
}

export default setup;