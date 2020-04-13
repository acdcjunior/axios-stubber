"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const findAllFilesInFolder_1 = require("./utils/findAllFilesInFolder");
function loadStubs(folderOrFile) {
    const stubs = doLoadStubs(folderOrFile);
    validateNoDuplicatedStubs(stubs);
    return stubs;
}
exports.default = loadStubs;
function doLoadStubs(folderOrFile) {
    if (Array.isArray(folderOrFile)) {
        if (folderOrFile.length === 0) {
            throw new Error("Received stubs array is empty.");
        }
        if (typeof folderOrFile[0] === "string") {
            return folderOrFile.flatMap(loadStubsFromFolderOrFile);
        }
        return folderOrFile;
    }
    else {
        return loadStubsFromFolderOrFile(folderOrFile);
    }
}
function loadStubsFromFolderOrFile(folderOrFile) {
    let resolvedFolderOrFile = path.resolve(folderOrFile);
    if (fs.statSync(resolvedFolderOrFile).isDirectory()) {
        let allFilesInFolder = findAllFilesInFolder_1.default(resolvedFolderOrFile);
        return allFilesInFolder.filter(f => path.extname(f) === 'json').flatMap(require);
    }
    try {
        return require(resolvedFolderOrFile);
    }
    catch (e) {
        throw new Error('Error while loading file "' + resolvedFolderOrFile + '": ' + e.message);
    }
}
function toJSON(o) {
    return JSON.stringify(o, null, '  ');
}
function validateNoDuplicatedStubs(stubs) {
    let alreadyPresent = {};
    stubs.forEach(stub => {
        if (!stub.request || !stub.response) {
            throw new Error("Every stub should have a request and a response property. Obtained: " + toJSON(stub));
        }
        let req = stub.request.method + stub.request.url + JSON.stringify(stub.request.body);
        if (alreadyPresent[req]) {
            throw new Error("Every request (method/url/body) must be declared only once. Found a request declared at least twice.\n\n" +
                "First declaration:\n" + toJSON(alreadyPresent[req]) + "\n\n" +
                "Second declaration:\n" + toJSON(stub));
        }
        alreadyPresent[req] = stub;
    });
}
//# sourceMappingURL=stubs.js.map