# axios-stubber

[![axios-stubber version](https://img.shields.io/npm/v/axios-stubber?color=green)](https://www.npmjs.com/package/axios-stubber)

Simplified axios request and response stubbing.

Stubs `axios` globally, making its calls return as specified in stubs files (or objects).

```sh
npm i -D axios-stubber
yarn add --dev axios-stubber
```

# axiosStubber

```js
const axios = require('axios');
const axiosStubber = require('axios-stubber');

test('axios-stubber example', async () => {
    axiosStubber(axios, {
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
    }); // the argument could also be an array, a json file, or js file 

    let {data, status} = await axios.get("https://w00t.com");

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

    let axiosMockControl;
    afterEach(() => {
        if (axiosMockControl) axiosMockControl.restore();
    });

    it('get', async () => {
        axiosMockControl = axiosStubber(axios, __dirname + '/stubs/exampleApi.stubs.json');

        let {data} = await axios.get("http://master.example.com/info?code=123");
        expect(data).toStrictEqual({result: 123456});
    });

    it('post', async () => {
        axiosMockControl = axiosStubber(axios, __dirname + '/stubs/exampleApi.stubs.json');

        let r = await go();
        expect(r).toStrictEqual({yay: true});
    });

    it('get', async () => {
        axiosMockControl = axiosStubber(axios, [__dirname + '/stubs/exampleApi.stubs.json']);

        let {data} = await axios.get("http://master.example.com/info?code=123");
        expect(data).toStrictEqual({result: 123456});
    });

    it('get', async () => {
        axiosMockControl = axiosStubber(axios, [
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
```


# axiosStubsRecorder

Intercepts all axios calls and generates a stubs file for later use.

```js
const axiosStubsRecorder = require('axios-stubber').axiosStubsRecorder;

test('t1 - save to new file', async () => {
    const axiosMockControl = axiosStubsRecorder(axios, 'my.stubs.json');

    let {data} = await axios.get("https://reqres.in/api/users/3");

    expect(data.data.first_name).toEqual('Emma');
    expect(data.data.last_name).toEqual('Wong');

    // you can now check that 'my.stubs.json' has all requests and responses recorded
    
    axiosMockControl.restore();
});
```