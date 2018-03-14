const opencage = require('../opencage');

describe('OpenCage Lib suite', () => {
  test('library exists', () => {
    expect(opencage).toBeTruthy();
  });
  describe('Rainy Tests', () => {
    describe('Query String', () => {
      test('no queryStringParameters', done => {
        const event = {};
        const context = null;
        const callback = (ctx, data) => {
          expect(data).toEqual(opencage.errorQueryString);
          done();
        };
        opencage.geocode(event, context, callback);
      });
    });
    describe('Environment', () => {
      let backup;
      beforeAll(() => {
        backup = process.env.OCD_API_KEY;
        delete process.env.OCD_API_KEY;
      });
      afterAll(() => {
        process.env.OCD_API_KEY = backup;
      });
      test('no env var', done => {
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
});
