"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generateErrorMessage_1 = require("../src/generateErrorMessage");
const stubs_1 = require("../src/stubs");
const stripColors = require('./stripColors');
describe('x', () => {
    console.log(2);
    it('y', () => {
        expect(stripColors(generateErrorMessage_1.default("GET", "http://bob.com", undefined, stubs_1.default(__dirname + '/stubs'))).trim())
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
//# sourceMappingURL=generateErrorMessage.test.js.map