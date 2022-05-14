"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AxiosStubberAdapter = exports.axiosStubsRecorder = exports.axiosStubber = void 0;
const adapter_1 = require("./adapter/adapter");
exports.AxiosStubberAdapter = adapter_1.default;
const axiosStubber_1 = require("./axiosStubber");
exports.axiosStubber = axiosStubber_1.default;
const axiosStubsRecorder_1 = require("./recorder/axiosStubsRecorder");
exports.axiosStubsRecorder = axiosStubsRecorder_1.default;
exports.default = axiosStubber_1.default;
//# sourceMappingURL=index.js.map