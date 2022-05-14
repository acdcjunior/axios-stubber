const go = require('./go');
const axios = require('axios');

const axiosStubber = require('../src').default;

const object = require('./parameterTypesStubs/fileWithObject');

describe('axiosStubber - parameterTypes', () => {

  let axiosMock;
  afterEach(() => {
    if (axiosMock) axiosMock.restore();
  });

  it('inline object', async () => {
    const inlineObject = { ...object, response: { ...object.response, body: { yes: 'we can (inlineObject)' } } };
    axiosMock = axiosStubber(axios, inlineObject);

    let {data} = await axios.get("https://w00t.com");
    expect(data).toStrictEqual({yes: "we can (inlineObject)"});
  });

  it('inline object array', async () => {
    const inlineObjectArray = [{ ...object, response: { ...object.response, body: { yes: 'we can (inlineObjectArray)' } } }];
    axiosMock = axiosStubber(axios, inlineObjectArray);

    let {data} = await axios.get("https://w00t.com");
    expect(data).toStrictEqual({yes: "we can (inlineObjectArray)"});
  });

  it('file with array - js (single file name)', async () => {
    axiosMock = axiosStubber(axios, __dirname + '/parameterTypesStubs/fileWithArray.js');

    let {data} = await axios.get("https://w00t.com");
    expect(data).toStrictEqual({yes: "we can (array js)"});
  });

  it('file with array - js (array of file names)', async () => {
    axiosMock = axiosStubber(axios, [__dirname + '/parameterTypesStubs/fileWithArray.js']);

    let {data} = await axios.get("https://w00t.com");
    expect(data).toStrictEqual({yes: "we can (array js)"});
  });

  it('file with object - js (single file name)', async () => {
    axiosMock = axiosStubber(axios, __dirname + '/parameterTypesStubs/fileWithObject.js');

    let {data} = await axios.get("https://w00t.com");
    expect(data).toStrictEqual({yes: "we can (object js)"});
  });

  it('file with object - js (array of file names)', async () => {
    axiosMock = axiosStubber(axios, [__dirname + '/parameterTypesStubs/fileWithObject.js']);

    let {data} = await axios.get("https://w00t.com");
    expect(data).toStrictEqual({yes: "we can (object js)"});
  });

  it('file with array - json (single file name)', async () => {
    axiosMock = axiosStubber(axios, __dirname + '/parameterTypesStubs/fileWithArray.json');

    let {data} = await axios.get("https://w00t.com");
    expect(data).toStrictEqual({yes: "we can (array json)"});
  });

  it('file with array - json (array of file names)', async () => {
    axiosMock = axiosStubber(axios, [__dirname + '/parameterTypesStubs/fileWithArray.json']);

    let {data} = await axios.get("https://w00t.com");
    expect(data).toStrictEqual({yes: "we can (array json)"});
  });

  it('file with object - json (single file name)', async () => {
    axiosMock = axiosStubber(axios, __dirname + '/parameterTypesStubs/fileWithObject.json');

    let {data} = await axios.get("https://w00t.com");
    expect(data).toStrictEqual({yes: "we can (object json)"});
  });

  it('file with object - json (array of file names)', async () => {
    axiosMock = axiosStubber(axios, [__dirname + '/parameterTypesStubs/fileWithObject.json']);

    let {data} = await axios.get("https://w00t.com");
    expect(data).toStrictEqual({yes: "we can (object json)"});
  });

});
