const dotenv = require('dotenv');

dotenv.config();

describe('Environment VARs suite', () => {
  test('OCD_API_KEY exisits', () => {
    expect(process.env.OCD_API_KEY).toBeTruthy();
  });
});
