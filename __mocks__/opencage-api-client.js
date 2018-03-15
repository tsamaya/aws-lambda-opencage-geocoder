const brandenburg = require('./stubs/brandenburg_gate.json');

const opencageAPI = jest.genMockFromModule('opencage-api-client');

const geocode = query =>
  new Promise((resolve, reject) => {
    if (query.q === '52.5162767 13.3777025') {
      resolve(brandenburg);
    } else if (query.q === 'networkerror') {
      reject(new Error('Mocked error'));
    } else {
      reject(new Error('Unexpected Mocked error'));
    }
  });

opencageAPI.geocode = geocode;

module.exports = opencageAPI;
