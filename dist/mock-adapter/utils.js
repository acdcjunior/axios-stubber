"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCouldNotFindMockError = exports.createAxiosError = exports.settle = exports.purgeIfReplyOnce = exports.findHandler = exports.isArrayBuffer = exports.isStream = exports.isObjectOrArray = exports.isFunction = exports.find = exports.isBlob = exports.isBuffer = exports.isEqual = void 0;
const axios_1 = require("axios");
exports.isEqual = require("fast-deep-equal");
exports.isBuffer = require("is-buffer");
exports.isBlob = require("is-blob");
const toString = Object.prototype.toString;
// < 0.13.0 will not have default headers set on a custom instance
const rejectWithError = !!axios_1.default.create().defaults.headers;
function find(array, predicate) {
    const length = array.length;
    for (let i = 0; i < length; i++) {
        const value = array[i];
        if (predicate(value))
            return value;
    }
}
exports.find = find;
function isFunction(val) {
    return toString.call(val) === "[object Function]";
}
exports.isFunction = isFunction;
function isObjectOrArray(val) {
    return val !== null && typeof val === "object";
}
exports.isObjectOrArray = isObjectOrArray;
function isStream(val) {
    return isObjectOrArray(val) && isFunction(val.pipe);
}
exports.isStream = isStream;
function isArrayBuffer(val) {
    return toString.call(val) === "[object ArrayBuffer]";
}
exports.isArrayBuffer = isArrayBuffer;
function combineUrls(baseURL, url) {
    if (baseURL) {
        return baseURL.replace(/\/+$/, "") + "/" + url.replace(/^\/+/, "");
    }
    return url;
}
function findHandler(handlers, method, url, body, parameters, headers, baseURL) {
    return find(handlers[method.toLowerCase()], function (handler) {
        if (typeof handler[0] === "string") {
            return ((isUrlMatching(url, handler[0]) ||
                isUrlMatching(combineUrls(baseURL, url), handler[0])) &&
                isBodyOrParametersMatching(method, body, parameters, handler[1]) &&
                isObjectMatching(headers, handler[2]));
        }
        else if (handler[0] instanceof RegExp) {
            return ((handler[0].test(url) || handler[0].test(combineUrls(baseURL, url))) &&
                isBodyOrParametersMatching(method, body, parameters, handler[1]) &&
                isObjectMatching(headers, handler[2]));
        }
    });
}
exports.findHandler = findHandler;
function isUrlMatching(url, required) {
    const noSlashUrl = url[0] === "/" ? url.substr(1) : url;
    const noSlashRequired = required[0] === "/" ? required.substr(1) : required;
    return noSlashUrl === noSlashRequired;
}
function isBodyOrParametersMatching(method, body, parameters, required) {
    const allowedParamsMethods = ["delete", "get", "head", "options"];
    if (allowedParamsMethods.indexOf(method.toLowerCase()) >= 0) {
        const params = required ? required.params : undefined;
        return isObjectMatching(parameters, params);
    }
    else {
        return isBodyMatching(body, required);
    }
}
function isObjectMatching(actual, expected) {
    if (expected === undefined)
        return true;
    if (typeof expected.asymmetricMatch === "function") {
        return expected.asymmetricMatch(actual);
    }
    return (0, exports.isEqual)(actual, expected);
}
function isBodyMatching(body, requiredBody) {
    if (requiredBody === undefined) {
        return true;
    }
    let parsedBody;
    try {
        parsedBody = JSON.parse(body);
    }
    catch (e) { }
    return isObjectMatching(parsedBody ? parsedBody : body, requiredBody);
}
function purgeIfReplyOnce(mock, handler) {
    Object.keys(mock.handlers).forEach(function (key) {
        const index = mock.handlers[key].indexOf(handler);
        if (index > -1) {
            mock.handlers[key].splice(index, 1);
        }
    });
}
exports.purgeIfReplyOnce = purgeIfReplyOnce;
function settle(resolve, reject, response, delay) {
    if (delay > 0) {
        setTimeout(settle, delay, resolve, reject, response);
        return;
    }
    // Support for axios < 0.13
    if (!rejectWithError && (!response.config || !response.config.validateStatus)) {
        if (response.status >= 200 && response.status < 300) {
            resolve(response);
        }
        else {
            reject(response);
        }
        return;
    }
    if (!response.config.validateStatus ||
        response.config.validateStatus(response.status)) {
        resolve(response);
    }
    else {
        if (!rejectWithError) {
            return reject(response);
        }
        reject(createAxiosError('Request failed with status code ' + response.status, response.config, response));
    }
}
exports.settle = settle;
function createAxiosError(message, config, response, code) {
    const error = new Error(message);
    error.isAxiosError = true;
    error.config = config;
    if (response !== undefined) {
        error.response = response;
    }
    if (code !== undefined) {
        error.code = code;
    }
    error.toJSON = function toJSON() {
        return {
            // Standard
            message: this.message,
            name: this.name,
            // Microsoft
            description: this.description,
            number: this.number,
            // Mozilla
            fileName: this.fileName,
            lineNumber: this.lineNumber,
            columnNumber: this.columnNumber,
            stack: this.stack,
            // Axios
            config: this.config,
            code: this.code,
        };
    };
    return error;
}
exports.createAxiosError = createAxiosError;
function createCouldNotFindMockError(config) {
    const message = "Could not find mock for: \n" +
        JSON.stringify(config, ["method", "url"], 2);
    const error = new Error(message);
    error.isCouldNotFindMockError = true;
    error.url = config.url;
    error.method = config.method;
    return error;
}
exports.createCouldNotFindMockError = createCouldNotFindMockError;
//# sourceMappingURL=utils.js.map