import * as fs from "fs";
import MockAdapter from 'axios-mock-adapter';
import {AxiosInstance, AxiosStatic} from "axios";
import {Stub} from "../Stub";

export interface StubsRecorderOptions {
    includeHeaders?: boolean;
    stubTransformer?: (s: Stub) => Stub
}
const DEFAULT_OPTIONS: StubsRecorderOptions = {
    includeHeaders: false,
    stubTransformer: s => s
};

let currentMockAdapter;
export default function axiosStubsRecorder(axios: AxiosStatic, stubsFileName: string, options: StubsRecorderOptions): MockAdapter {
    if (currentMockAdapter) {
        currentMockAdapter.restore();
    }
    const unmockedAxios = axios.create();
    currentMockAdapter = new MockAdapter(axios);

    recordRequests(stubsFileName, unmockedAxios, currentMockAdapter, { ...DEFAULT_OPTIONS, ...options });

    return currentMockAdapter;
};

function stringToStubsArray(text: string) {
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
    return previouslySavedStub => {
        let stubJSON = JSON.stringify(previouslySavedStub.request);
        return currentRequestJSON === stubJSON;
    };
}

function getComparePropsAsJson(s: Stub) {
    // places URL before METHOD when sorting
    return JSON.stringify({
        url: s.request.url,
        method: s.request.method,
        body: s.request.body,
        headers: s.request.headers,
    });
}

function compareStubs(a: Stub, b: Stub) {
    return getComparePropsAsJson(a).localeCompare(getComparePropsAsJson(b));
}

function recordRequests(stubsFileName, unmockedAxios: AxiosInstance, axiosMockAdapter, options: StubsRecorderOptions) {

    axiosMockAdapter.onAny().reply((async config => {
        const response = await unmockedAxios.request(config);

        const stubs = loadStubsFromFile(stubsFileName);

        const newStub  = options.stubTransformer({
            request: {
                method: config.method.toUpperCase(),
                url: config.url,
                headers: options.includeHeaders ? config.headers : undefined,
                body: extractData(config)
            },
            response: {
                status: response.status,
                headers: options.includeHeaders ? response.headers : undefined,
                body: response.data,
            }
        });

        let stubPreviouslySaved = stubs.find(requestsEqual(newStub.request));
        let otherStubs = stubPreviouslySaved ? stubs.filter(stub => !requestsEqual(newStub.request)(stub)) : stubs;

        const transformedStubs: Stub[] = [ newStub, ...otherStubs ].sort(compareStubs);

        fs.writeFileSync(stubsFileName, JSON.stringify(transformedStubs, null, '  '));

        return [response.status, response.data, response.headers];
    }) as any);

}
