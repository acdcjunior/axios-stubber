"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generateErrorMessage_1 = require("./generateErrorMessage");
const stubs_1 = require("./stubs");
const mock_adapter_1 = require("./mock-adapter/mock-adapter");
let currentMockAdapter;
function axiosStubber(axios, folderOrFileOrObjectOrArray) {
    if (currentMockAdapter) {
        currentMockAdapter.restore();
    }
    currentMockAdapter = new mock_adapter_1.default(axios);
    mockRequests(currentMockAdapter, (0, stubs_1.default)(folderOrFileOrObjectOrArray));
    return currentMockAdapter;
}
exports.default = axiosStubber;
;
function mockRequests(axiosMockAdapter, stubs) {
    stubs.forEach(stub => {
        switch (stub.request.method.toUpperCase()) {
            case "GET":
                axiosMockAdapter.onGet(stub.request.url).reply(stub.response.status || 200, stub.response.body);
                return;
            case "POST":
                axiosMockAdapter.onPost(stub.request.url, stub.request.body).reply(stub.response.status || 200, stub.response.body);
                return;
            default:
                throw new Error("Method " + stub.request.method.toUpperCase() + " not yet supported.");
        }
    });
    axiosMockAdapter.onAny().reply((config => {
        let method = config.method;
        let url = config.url;
        let data = config.data;
        throw new Error((0, generateErrorMessage_1.default)(method, url, data, stubs));
    }));
}
//# sourceMappingURL=axiosStubber.js.map