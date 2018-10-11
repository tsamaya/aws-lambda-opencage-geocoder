const opencage = require('../opencage');

describe('Integration Tests', () => {
  if (process.env.CI) {
    // skip this test on CI,
    //    then eslint disable line to prevent jest/no-disabled-tests
    // eslint-disable-next-line
    test.skip('CI : skipping integration tests', () => {});
    return;
  }
  test('geocode `Brandenburg Gate`', done => {
    const event = {
      queryStringParameters: { q: 'Brandenburg Gate' },
    };
    const context = null;
    const callback = (ctx, data) => {
      expect(data).toBeTruthy();
      done();
    };
    opencage.geocode(event, context, callback);
  });
  test('geocode `Brandenburg Gate` with pretty', done => {
    const event = {
      queryStringParameters: { q: 'Brandenburg Gate', pretty: '1' },
    };
    const context = null;
    const callback = (ctx, data) => {
      expect(data).toBeTruthy();
      done();
    };
    opencage.geocode(event, context, callback);
  });
});
