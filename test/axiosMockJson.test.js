const go = require('./go');
const axios = require('axios');

const axiosStubber = require('../src').default;

describe('axiosStubber', () => {

    let axiosMock;
    afterEach(() => {
        if (axiosMock) axiosMock.restore();
    });

    it('get + create', async () => {
        axiosMock = axiosStubber(axios, __dirname + '/stubs/exampleApi.stubs.json');

        let axiosInstance = axios.create({
            headers: { 'Content-Type': 'application/json' },
            timeout: 120000,
            baseURL: "http://master.example.com"
        });
        let {data} = await axiosInstance.get("/info?code=123");
        expect(data).toStrictEqual({result: 123456});
    });

    it('post', async () => {
        axiosMock = axiosStubber(axios, __dirname + '/stubs/exampleApi.stubs.json');

        let r = await go();
        expect(r).toStrictEqual({yay: true});
    });

    it('get (array)', async () => {
        axiosMock = axiosStubber(axios, [__dirname + '/stubs/exampleApi.stubs.json']);

        let {data} = await axios.get("http://master.example.com/info?code=123");
        expect(data).toStrictEqual({result: 123456});
    });

    it('get (inline object)', async () => {
        axiosMock = axiosStubber(axios, [
            {
                request: {
                    method: "GET",
                    url: "https://w00t.com"
                },
                response: {
                    status: 201,
                    body: {
                        yes: "It is"
                    }
                }
            }
        ]);

        let {data, status} = await axios.get("https://w00t.com");
        expect(data).toStrictEqual({yes: "It is"});
        expect(status).toStrictEqual(201);
    });

});