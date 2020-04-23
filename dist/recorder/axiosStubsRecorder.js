"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const axios_mock_adapter_1 = require("axios-mock-adapter");
const DEFAULT_OPTIONS = {
    includeHeaders: false,
    stubTransformer: s => s
};
let currentMockAdapter;
function axiosStubsRecorder(axios, stubsFileName, options) {
    if (currentMockAdapter) {
        currentMockAdapter.restore();
    }
    // @ts-ignore
    const unmockedAxios = axios.create();
    currentMockAdapter = new axios_mock_adapter_1.default(axios);
    recordRequests(stubsFileName, unmockedAxios, currentMockAdapter, { ...DEFAULT_OPTIONS, ...options });
    return currentMockAdapter;
}
exports.default = axiosStubsRecorder;
;
function stringToStubsArray(text) {
    if (text === '') {
        return [];
    }
    let stubs = JSON.parse(text);
    if (!stubs) {
        return [];
    }
    if (!Array.isArray(stubs)) {
        return [stubs];
    }
    return stubs;
}
function loadStubsFromFile(path) {
    if (!fs.existsSync(path)) {
        return stringToStubsArray('');
    }
    return stringToStubsArray(fs.readFileSync(path, 'utf8'));
}
const BODY_METHODS = ['POST', 'PUT'];
function extractData(config) {
    if (BODY_METHODS.includes(config.method.toUpperCase()) && (config.headers['Content-Type'] || '').includes('application/json')) {
        return JSON.parse(config.data);
    }
    return config.data;
}
function requestsEqual(currentRequest) {
    const currentRequestJSON = JSON.stringify(currentRequest);
    return previouslySavedStub => currentRequestJSON === JSON.stringify(previouslySavedStub.request);
}
function recordRequests(stubsFileName, unmockedAxios, axiosMockAdapter, options) {
    axiosMockAdapter.onAny().reply((async (config) => {
        const response = await unmockedAxios.request(config);
        const stubs = loadStubsFromFile(stubsFileName);
        let request = {
            method: config.method.toUpperCase(),
            url: config.url,
            headers: options.includeHeaders ? config.headers : undefined,
            body: extractData(config)
        };
        let stubPreviouslySaved = stubs.find(requestsEqual(request));
        if (!stubPreviouslySaved) {
            stubPreviouslySaved = {};
            stubs.push(stubPreviouslySaved);
        }
        Object.assign(stubPreviouslySaved, {
            request,
            response: {
                status: response.status,
                headers: options.includeHeaders ? response.headers : undefined,
                body: response.data,
            }
        });
        const transformedStubs = stubs.map(options.stubTransformer);
        transformedStubs.sort((a, b) => (a.request.url + a.request.method.toUpperCase()).localeCompare(b.request.url + b.request.method.toUpperCase()));
        fs.writeFileSync(stubsFileName, JSON.stringify(transformedStubs, null, '  '));
        return [response.status, response.data, response.headers];
    }));
}
//# sourceMappingURL=axiosStubsRecorder.js.map