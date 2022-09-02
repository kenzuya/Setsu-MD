import path from "path";
import { tmpdir } from "os";
import * as Crypto from "crypto";
import { writeFileSync, unlinkSync, readFileSync } from "fs";
import { default as ff } from "fluent-ffmpeg";
export type Metadata = {
    packname: string;
    author: string;
    categories: string;
};
export async function imageToWebp(media: Buffer) {
    const tmpFileOut = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
    const tmpFileIn = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.jpg`);

    writeFileSync(tmpFileIn, media);

    await new Promise((resolve, reject) => {
        ff(tmpFileIn)
            .on("error", reject)
            .on("end", () => resolve(true))
            .addOutputOptions([
                "-vcodec",
                "libwebp",
                "-vf",
                "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
            ])
            .toFormat("webp")
            .save(tmpFileOut);
    });

    const buff = readFileSync(tmpFileOut);
    unlinkSync(tmpFileOut);
    unlinkSync(tmpFileIn);
    return buff;
}

export async function videoToWebp(media: Buffer) {
    const tmpFileOut = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
    const tmpFileIn = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`);

    writeFileSync(tmpFileIn, media);

    await new Promise((resolve, reject) => {
        ff(tmpFileIn)
            .on("error", reject)
            .on("end", () => resolve(true))
            .addOutputOptions([
                "-vcodec",
                "libwebp",
                "-vf",
                "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
                "-loop",
                "0",
                "-ss",
                "00:00:00",
                "-t",
                "00:00:05",
                "-preset",
                "default",
                "-an",
                "-vsync",
                "0",
            ])
            .toFormat("webp")
            .save(tmpFileOut);
    });

    const buff = readFileSync(tmpFileOut);
    unlinkSync(tmpFileOut);
    unlinkSync(tmpFileIn);
    return buff;
}
