"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
function findAllFilesInFolder(dir) {
    return fs.readdirSync(dir).map(fileName => {
        const fullFile = path.join(dir, fileName);
        if (fs.statSync(fullFile).isDirectory()) {
            return findAllFilesInFolder(fullFile);
        }
        else {
            return [fullFile];
        }
    });
}
exports.default = findAllFilesInFolder;
//# sourceMappingURL=findAllFilesInFolder.js.map