import {Stub} from "./Stub";
import * as path from "path";
import * as fs from "fs";
import findAllFilesInFolder from "./utils/findAllFilesInFolder";

export default function loadStubs(folderOrFile: string | any) {
    const stubs = doLoadStubs(folderOrFile);
    validateNoDuplicatedStubs(stubs);
    return stubs;
}

function doLoadStubs(folderOrFile: string | any) {
    if (Array.isArray(folderOrFile)) {
        if (folderOrFile.length === 0) {
            throw new Error("Received stubs array is empty.");
        }
        if (typeof folderOrFile[0] === "string") {
            return folderOrFile.flatMap(loadStubsFromFolderOrFile);
        }
        return folderOrFile;
    } else {
        return loadStubsFromFolderOrFile(folderOrFile);
    }
}

function loadStubsFromFolderOrFile(folderOrFile: string): Stub[] {
    let resolvedFolderOrFile = path.resolve(folderOrFile);
    if (fs.statSync(resolvedFolderOrFile).isDirectory()) {
        let allFilesInFolder = findAllFilesInFolder(resolvedFolderOrFile);
        return allFilesInFolder.filter(f => path.extname(f) === 'json').flatMap(require);
    }
    try {
        return require(resolvedFolderOrFile);
    } catch (e) {
        throw new Error('[AXIOS STUBS] Error while loading stubs file "'+resolvedFolderOrFile+'": ' + e.message)
    }
}

function toJSON(o) {
    return JSON.stringify(o, null, '  ')
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
                "Second declaration:\n" + toJSON(stub)
            );
        }
        alreadyPresent[req] = stub;
    });
}