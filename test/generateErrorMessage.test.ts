import generateErrorMessage from "../src/generateErrorMessage";
import loadStubs from "../src/stubs";
const stripColors = require('./stripColors');

describe('x', () => {
    console.log(2)


    it('y', () => {

        expect(
            stripColors(generateErrorMessage("GET", "http://bob.com", undefined, loadStubs(__dirname + '/stubs'))).trim())
            .toBe(`No configured request exactly matches the received call.
            
Received call:
- method: GET
  url: http://bob.com


Configured requests (ordered by most similar):
- method: POST
  url: http://bob.example.com
 

- method: POST
  url: http://master.example.com/infox`);
    });

});