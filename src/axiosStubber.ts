import generateErrorMessage from "./generateErrorMessage";
import loadStubs from "./stubs";
import {AxiosInstance} from "axios";
import MockAdapter from "./mock-adapter/mock-adapter";

let currentMockAdapter;
export default function axiosStubber(axios: AxiosInstance, folderOrFileOrObjectOrArray: string | string[] | any[] | any): typeof MockAdapter {
    if (currentMockAdapter) {
        currentMockAdapter.restore();
    }
    currentMockAdapter = new MockAdapter(axios);

    mockRequests(currentMockAdapter, loadStubs(folderOrFileOrObjectOrArray));

    return currentMockAdapter;
};

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

        throw new Error(generateErrorMessage(method, url, data, stubs));
    }) as any);
}
