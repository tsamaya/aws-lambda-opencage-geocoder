require('dotenv').config();
const opencage = require('opencage-api-client');

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
  const query = event.queryStringParameters;
  query.key = process.env.OCD_API_KEY;
  opencage
    .geocode(query)
    .then(data => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify(data),
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
