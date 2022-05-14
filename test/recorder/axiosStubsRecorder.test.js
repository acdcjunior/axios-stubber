const fs = require('fs');
const axios = require('axios');
const { axiosStubsRecorder } = require('../../src')



function deleteIfExists(file) {
    if (fs.existsSync(file)) {
        fs.unlinkSync(file);
    }
}

function verifyFilesHaveEqualContent(actualFileName, expectedFileName, transfomer = s => s) {
    let actual = transfomer(fs.readFileSync(actualFileName, 'utf8'));
    let expected = fs.readFileSync(expectedFileName, 'utf8');
    expect(actual).toEqual(expected);
}

function transformUserCreatedResponse(response) {
    return response.replace(/\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d\d\dZ/g, '2020-01-01T00:00:00.000Z').replace(/"id": "\d+",/g, '"id": "999",')
}

describe('axiosStubsRecorder', () => {

    let axiosMock;
    afterEach(() => {
        if (axiosMock) axiosMock.restore();
    });

    it('t1 - save to new file', async () => {
        let stubsFileNameToRecord = __dirname + '/recorded-stubs/t1.stubs.json';
        deleteIfExists(stubsFileNameToRecord);

        axiosMock = axiosStubsRecorder(axios, stubsFileNameToRecord);

        let {data} = await axios.get("https://reqres.in/api/users/3");

        expect(data.data.first_name).toEqual('Emma');
        expect(data.data.last_name).toEqual('Wong');

        verifyFilesHaveEqualContent(stubsFileNameToRecord, __dirname + '/fixture-stubs/t1_expected.stubs.json');
    });

    it('t2 - save sorted', async () => {
        let stubsFileNameToRecord = __dirname + '/recorded-stubs/t2.stubs.json';
        deleteIfExists(stubsFileNameToRecord);

        axiosMock = axiosStubsRecorder(axios, stubsFileNameToRecord);

        await axios.get("https://reqres.in/api/users/4");
        await axios.get("https://reqres.in/api/users/5");
        // await axios.post("https://reqres.in/api/users");
        await axios.get("https://reqres.in/api/users");
        await axios.get("https://reqres.in/api/users/3");

        verifyFilesHaveEqualContent(stubsFileNameToRecord, __dirname + '/fixture-stubs/t2_expected.stubs.json', transformUserCreatedResponse);
    });

    it('t3 - update existing', async () => {
        let stubsFileNameToRecord = __dirname + '/recorded-stubs/t3.stubs.json';
        deleteIfExists(stubsFileNameToRecord);
        fs.copyFileSync(__dirname + '/fixture-stubs/t3_to_be_modified.stubs.json', stubsFileNameToRecord);

        axiosMock = axiosStubsRecorder(axios, stubsFileNameToRecord);

        await axios.get("https://reqres.in/api/users/3");

        verifyFilesHaveEqualContent(stubsFileNameToRecord, __dirname + '/fixture-stubs/t3_expected.stubs.json');
    });

    it('t4 - post (different body == different request)', async () => {
        let stubsFileNameToRecord = __dirname + '/recorded-stubs/t4.stubs.json';
        deleteIfExists(stubsFileNameToRecord);

        axiosMock = axiosStubsRecorder(axios, stubsFileNameToRecord);

        await axios.post("https://reqres.in/api/users", { test: 't4-1' });
        await axios.post("https://reqres.in/api/users", { test: 't4-2' });

        verifyFilesHaveEqualContent(stubsFileNameToRecord, __dirname + '/fixture-stubs/t4_expected.stubs.json', transformUserCreatedResponse);
    });

    it('t5 - transform function', async () => {
        let stubsFileNameToRecord = __dirname + '/recorded-stubs/t5.stubs.json';
        deleteIfExists(stubsFileNameToRecord);

        axiosMock = axiosStubsRecorder(axios, stubsFileNameToRecord, { stubTransformer: (stub) => {
            return {
                request: { ...stub.request, body: { ...stub.request.body, fieldToBeTransformed: stub.request.body.fieldToBeTransformed.toUpperCase() + "!?" } },
                response: { ...stub.response, body: { ...stub.response.body, fieldToBeTransformed: stub.response.body.fieldToBeTransformed.toUpperCase() + "?!" } } }
        }});

        await axios.post("https://reqres.in/api/users", { fieldToBeTransformed: 'xvalue' });

        verifyFilesHaveEqualContent(stubsFileNameToRecord, __dirname + '/fixture-stubs/t5_expected.stubs.json', transformUserCreatedResponse);
    });

    // todo add test in which initial stubs file has duplicated requests. end result should have removed those
    // todo add a test that transforms the request, so that the transformed request is used for comparison, not the original one

});