import stringSimilarity from "./utils/stringSimilarity";

export default function generateErrorMessage(method, url, data, stubs) {
    const receivedRequest = {method: method.toUpperCase(), url: url, ...(data && {body: JSON.parse(data)})};

    let stubsWithSimilarity = stubs.map(stub2 => {
        let stubRequest = {
            method: stub2.request.method,
            url: stub2.request.url, ...(data && {body: stub2.request.body})
        }; // guarantee prop order
        return {
            request: stubRequest,
            similarity: stringSimilarity(JSON.stringify(receivedRequest), JSON.stringify(stubRequest))
        };
    });
    stubsWithSimilarity.sort((scs1, scs2) => scs2.similarity - scs1.similarity);

    return `No configured request exactly matches the received call.
            
Received call:
\x1b[37m- method: \x1b[1m\x1b[36m${receivedRequest.method}\x1b[0m
  \x1b[37murl: \x1b[1m\x1b[36m${receivedRequest.url}\x1b[0m
` + (receivedRequest.body ? `  \x1b[37mbody: \x1b[1m\x1b[36m${JSON.stringify(receivedRequest.body, null, '  ').replace(/(\r?\n)/g, '$1  ')}\x1b[0m` : ``) + `

Configured requests (ordered by most similar):
${stubsWithSimilarity.map(s => requestToColorDiff(receivedRequest, s.request)).join('\n')}\x1b[0m
`;
}


function requestToColorDiff(baseRequest, otherRequest) {
    return `\x1b[37m- method: \x1b[0m${colorDiff(baseRequest.method, otherRequest.method)}
 \x1b[37m url: \x1b[0m${colorDiff(baseRequest.url, otherRequest.url)}
 ${
        baseRequest.body ?
            `\x1b[37m body: \x1b[0m${colorDiff(
                baseRequest.body !== undefined ? JSON.stringify(baseRequest.body, null, '  ') : `<undefined>`
                , otherRequest.body !== undefined ? JSON.stringify(otherRequest.body || '', null, '  ') : `<undefined>`
            ).replace(/(\r?\n)/g, '$1  ')}`
            : ''
        }
\x1b[0m`
}

function colorDiff(one, two) {
    if (!two) {
        return one;
    }
    let out = '\x1b[32m';
    let i = 0;
    while (i < one.length && i < two.length && one[i] === two[i]) {
        out += one[i];
        i++;
    }
    out += '\x1b[31m';
    out += two.slice(i, two.length);
    return out + '\x1b[0m';
}