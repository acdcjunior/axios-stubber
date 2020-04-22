import * as fs from "fs";
import MockAdapter from 'axios-mock-adapter';
import {AxiosInstance} from "axios";

let currentMockAdapter;
export default function axiosStubsRecorder(axios: AxiosInstance, stubsFileName: string, options = { includeHeaders: false }): MockAdapter {
    if (currentMockAdapter) {
        currentMockAdapter.restore();
    }
    // @ts-ignore
    const unmockedAxios = axios.create();
    currentMockAdapter = new MockAdapter(axios);

    mockRequests(stubsFileName, unmockedAxios, currentMockAdapter, options);

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

function mockRequests(stubsFileName, unmockedAxios: AxiosInstance, axiosMockAdapter, { includeHeaders }) {

    axiosMockAdapter.onAny().reply((async config => {
        const response = await unmockedAxios.request(config);

        const stubs = loadStubsFromFile(stubsFileName);

        let stubPreviouslySaved = stubs.find(stub => config.url === stub.request.url && config.method.toUpperCase() === stub.request.method.toUpperCase());

        if (!stubPreviouslySaved) {
            stubPreviouslySaved = { };
            stubs.push(stubPreviouslySaved);
        }

        Object.assign(stubPreviouslySaved, {
            request: {
                method: config.method.toUpperCase(),
                url: config.url,
                headers: includeHeaders ? config.headers : undefined,
                body: config.data
            },
            response: {
                status: response.status,
                headers: includeHeaders ? response.headers : undefined,
                body: response.data,
            }
        });

        stubs.sort((a, b) => (a.request.url + a.request.method.toUpperCase()).localeCompare(b.request.url + b.request.method.toUpperCase()));

        fs.writeFileSync(stubsFileName, JSON.stringify(stubs, null, '  '));

        return [response.status, response.data, response.headers];
    }) as any);
}
