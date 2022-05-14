const generateErrorMessage = require("../src/generateErrorMessage").default;
const loadStubs = require("../src/stubs").default;
const stripColors = require('./stripColors');

describe('generateErrorMessage', () => {

    it('error message is generated correctly', () => {

        expect(
            stripColors(generateErrorMessage("GET", "http://bob.com", undefined, loadStubs(__dirname + '/stubs'))).trim())
            .toBe(`No configured request exactly matches the received call.
            
Received call:
- method: GET
  url: http://bob.com


Configured requests (ordered by most similar):
- method: POST
  url: http://bob.example.com/info
 

- method: POST
  url: http://master.example.com/info
 

- method: POST
  url: http://master.example.com/infox
 

- method: GET
  url: http://master.example.com/info?code=123`);
    });

});