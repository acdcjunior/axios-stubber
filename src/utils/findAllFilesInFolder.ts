//@ts-ignore
import * as fs from "fs";
//@ts-ignore
import * as path from "path";

export default function findAllFilesInFolder(dir) {
    return fs.readdirSync(dir).flatMap(fileName => {
        const fullFile = path.join(dir, fileName);
        if (fs.statSync(fullFile).isDirectory()) {
            return findAllFilesInFolder(fullFile);
        } else {
            return [fullFile];
        }
    });
}