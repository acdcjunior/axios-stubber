# axios-stubber
Simplified axios request and response stubbing.

Stubs `axios` globally, making its calls return as specified in stubs files (or objects).

# Example

```js
const axios = require('axios');
const axiosStubber = require('axios-stubber');

test('axios-stubber example', async () => {
    axiosStubber(axios, {
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
    }); // the argument could also be an array, a json file, or js file 

    let {data, status} = await axios.get("http://w00t.com");

    expect(data).toStrictEqual({yes: "It is"});
    expect(status).toStrictEqual(201);
});
```

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