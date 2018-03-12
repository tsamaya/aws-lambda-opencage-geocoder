const opencage = require('opencage-api-client');
const dotenv = require('dotenv');

dotenv.config();

const doRequest = (query, callback) => {
  const params = query;
  params.key = process.env.OCD_API_KEY;
  const pretty = query.pretty === '1' ? '  ' : null;
  opencage
    .geocode(params)
    .then(data => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify(data, null, pretty),
      });
    })
    .catch(err => {
      // console.log(err);
      callback(null, {
        statusCode: 400,
        body: JSON.stringify(err),
      });
    });
};

/**
 * entry point
 * @param  {object}   event    [description]
 * @param  {object}   context  [description]
 * @param  {Function} callback [description]
 */
module.exports.geocode = (event, context, callback) => {
  if (!event.queryStringParameters) {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        error: 400,
        message: "Couldn't read query parameters",
      }),
    });
    return;
  }
  if (typeof process.env.OCD_API_KEY === 'undefined') {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        response: { status: { code: 403, message: 'missing API key' } },
      }),
    });
    return;
  }
  doRequest(event.queryStringParameters, callback);
};
