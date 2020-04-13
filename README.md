# axios-axios-stubber
Simplified axios request and response stubbing.

# Usage

```sh
  npm i -D axios-stubber
```

Test file:

```js
const go = require('./go');
const axios = require('axios');

const axiosStubber = require('axios-stubber');

describe('axiosStubber', () => {

    let axiosMock;
    afterEach(() => {
        if (axiosMock) axiosMock.restore();
    });

    it('get', async () => {
        axiosMock = axiosStubber(axios, __dirname + '/stubs/exampleApi.stubs.json');

        let {data} = await axios.get("http://master.example.com/info?code=123");
        expect(data).toStrictEqual({result: 123456});
    });

    it('post', async () => {
        axiosMock = axiosStubber(axios, __dirname + '/stubs/exampleApi.stubs.json');

        let r = await go();
        expect(r).toStrictEqual({yay: true});
    });

    it('get', async () => {
        axiosMock = axiosStubber(axios, [__dirname + '/stubs/exampleApi.stubs.json']);

        let {data} = await axios.get("http://master.example.com/info?code=123");
        expect(data).toStrictEqual({result: 123456});
    });

    it('get', async () => {
        axiosMock = axiosStubber(axios, [
            {
                request: {
                    method: "GET",
                    url: "http://w00t.com"
                },
                response: {
                    status: 201,
                    body: {
                        yes: "It is"
                    }
                }
            }
        ]);

        let {data, status} = await axios.get("http://w00t.com");
        expect(data).toStrictEqual({yes: "It is"});
        expect(status).toStrictEqual(201);
    });

});
```