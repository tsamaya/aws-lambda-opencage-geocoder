const opencage = require('../opencage');

describe('OpenCage Lib suite', () => {
  test('library exists', () => {
    expect(opencage).toBeTruthy();
    expect(typeof opencage).toBe('object');
  });
  describe('Rainy Tests', () => {
    describe('#Query String', () => {
      test('no queryStringParameters', (done) => {
        const event = {};
        const context = null;
        const callback = (ctx, data) => {
          expect(data).toEqual(opencage.errorQueryString);
          done();
        };
        opencage.geocode(event, context, callback);
      });
    });
    describe('#Environment', () => {
      let backup;
      beforeAll(() => {
        backup = process.env.OCD_API_KEY;
        delete process.env.OCD_API_KEY;
      });
      afterAll(() => {
        process.env.OCD_API_KEY = backup;
      });
      test('no env var', (done) => {
        const event = {
          queryStringParameters: { q: 'berlin' },
        };
        const context = null;
        const callback = (ctx, data) => {
          expect(data).toEqual(opencage.errorAPIKey);
          done();
        };
        opencage.geocode(event, context, callback);
      });
    });
  });
  describe('Mocked Tests', () => {
    beforeAll(() => {
      jest.mock('opencage-api-client');
    });
    afterAll(() => {
      jest.unmock('opencage-api-client');
    });
    test('reverse geocode `Brandenburg Gate`', (done) => {
      const event = {
        queryStringParameters: { q: '52.5162767 13.3777025' },
      };
      const context = null;
      const callback = (ctx, data) => {
        // console.log(data); // eslint-disable-line
        expect(data).toBeTruthy();
        done();
      };
      opencage.geocode(event, context, callback);
    });
    test('rejection', (done) => {
      const event = {
        queryStringParameters: { q: 'networkerror' },
      };
      const context = null;
      const callback = (ctx, data) => {
        expect(data).toBeTruthy();
        done();
      };
      opencage.geocode(event, context, callback);
    });
  });
});
