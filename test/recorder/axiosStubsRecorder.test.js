const fs = require('fs');
const axios = require('axios');

// noinspection JSUnresolvedVariable
const axiosStubsRecorder = require('../../').axiosStubsRecorder;

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
        await axios.post("https://reqres.in/api/users");
        await axios.get("https://reqres.in/api/users");
        await axios.get("https://reqres.in/api/users/3");

        verifyFilesHaveEqualContent(stubsFileNameToRecord, __dirname + '/fixture-stubs/t2_expected.stubs.json', s => {
            return s.replace(/\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d\d\dZ/g, '2020-12-25T12:34:56.789Z').replace(/"id": "\d+",/g, '"id": "999",')
        });
    });

    it('t3 - update existing', async () => {
        let stubsFileNameToRecord = __dirname + '/recorded-stubs/t3.stubs.json';
        deleteIfExists(stubsFileNameToRecord);
        fs.copyFileSync(__dirname + '/fixture-stubs/t3_to_be_modified.stubs.json', stubsFileNameToRecord);

        axiosMock = axiosStubsRecorder(axios, stubsFileNameToRecord);

        await axios.get("https://reqres.in/api/users/3");

        verifyFilesHaveEqualContent(stubsFileNameToRecord, __dirname + '/fixture-stubs/t3_expected.stubs.json');
    });

});