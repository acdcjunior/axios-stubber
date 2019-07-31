const axios = require('axios');

module.exports = function go() {
    return axios
        .create({baseURL: 'http://bob.example.com'})
        .post('/info', {"boo": "ya"})
        // .get('/info?q=123');
        .then(r => r.data);
};
