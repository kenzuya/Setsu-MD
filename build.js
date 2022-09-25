const { readdirSync, readFileSync, statSync, writeFileSync, existsSync, rmdirSync, mkdirSync } = require("fs");
const pack = require("./package.json");
const JSZip = require("jszip");
const { execSync } = require("child_process");
const zip = new JSZip();

function build() {
    if (existsSync("./build")) rmdirSync("./build", { recursive: true });
    console.log("Building...");
    execSync("tsc");
    console.log("Completed...");
    console.log("Archiving files...");
    if (!existsSync("./dist")) mkdirSync("./dist");
    const dir = readdirSync("./build");
    console.log("Creating Zip files...");
    dir.forEach((subdir) => {
        const stats = statSync(`./build/${subdir}`);
        // console.log(stats);

        if (stats.isDirectory()) {
            const folder = zip.folder(subdir);
            const files = readdirSync(`./build/${subdir}`);
            files.forEach((files) => {
                // console.log(__dirname);
                if (files.startsWith("_")) return;
                else folder?.file(files, readFileSync(`./build/${subdir}/${files}`));
            });
        } else zip.file(subdir, readFileSync(`./build/${subdir}`));
    });

    delete pack.devDependencies;
    pack.scripts.start = "node index.js";
    const packaged = JSON.stringify(pack, null, 2);
    zip.file("package.json", packaged);
    if (JSZip.support.uint8array)
        zip.generateAsync({ type: "uint8array" }).then((blob) => {
            writeFileSync(`./dist/${pack.name}-${pack.version}.zip`, blob);
        });
    else zip.generateAsync({ type: "string" });
    console.log("Completed, file saved in" + `./dist/${pack.name}-${pack.version}.zip`);
    // console.log(zip);
}
// console.log(dir);
build();
