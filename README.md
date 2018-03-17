# aws-lambda-opencage-geocoder

This repository shows how to create an [AWS lambda](https://aws.amazon.com/lambda/) function to wrap OpenCage Data [Geocoder](https://geocoder.opencagedata.com/) API.

[![CircleCI](https://circleci.com/gh/tsamaya/aws-lambda-opencage-geocoder.svg?style=svg)](https://circleci.com/gh/tsamaya/aws-lambda-opencage-geocoder)
[![codecov](https://codecov.io/gh/tsamaya/aws-lambda-opencage-geocoder/branch/master/graph/badge.svg)](https://codecov.io/gh/tsamaya/aws-lambda-opencage-geocoder)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

The following how-to section describes step by steps how to create the AWS lambda function using [serverless](https://serverless.com/) and how to deploy it on AWS; then later, the [quick start](#quick-start) section describes how to just use this repo where the ready to use function.

## How to create a AWS Lambda function

We will create a Lambda Function using [node](https://nodejs.org/en/) and [serverless](https://serverless.com/framework/docs/) framework.

### Prerequisites

- node, npm or yarn
- aws-cli ?
- serverless: for convienience install it globally  
`$ npm install -g serverless`

### AWS - Credentials
To deploy; an AWS account is needed, AWS lambda is available with the free tier account for 12 months : check [aws pricing](https://aws.amazon.com/lambda/pricing/).

[Watch the video on setting up credentials](https://www.youtube.com/watch?v=KngM5bfpttA)

Or look at serverles documentatoon about [credentials](https://serverless.com/framework/docs/providers/aws/guide/credentials/)

When you AWS account is ready to use, create the local profile for AWS:

    $ serverless config credentials --provider aws --key <YOUR-AWS-KEY> --secret <YOUR-AWS-SECRET> --profile <namedProfile>

*NB* naming a profile is usefull when using more than one profile

### How to

First we will create a boilerplate project for aws-nodejs

    $ serverless create --template aws-nodejs --path aws-lambda-opencage-geocoder

```shell
Serverless: Generating boilerplate...
Serverless: Generating boilerplate in "/Users/tsamaya/work/temp/aws-lambda-opencage-geocoder"
 _______                             __
|   _   .-----.----.--.--.-----.----|  .-----.-----.-----.
|   |___|  -__|   _|  |  |  -__|   _|  |  -__|__ --|__ --|
|____   |_____|__|  \___/|_____|__| |__|_____|_____|_____|
|   |   |             The Serverless Application Framework
|       |                           serverless.com, v1.26.1
 -------'

Serverless: Successfully generated boilerplate for template: "aws-nodejs"
```

    $ cd aws-lambda-opencage-geocoder/

    $ ls -al

will output this directory structure
```
.
├── .gitignore
├── handler.js
└── serverless.yml
```

`handler.js` contains a hello world example.


Initialize node package file : `package.json`

    $ npm init -y


Install dependencies

	$ npm i -S opencage-api-client dotenv

- serverless helpers
```
 $ npm i -D serverless-env-generator serverless-offline
```

Edit serverless.yml file, adding this after `provider:` section

```yaml
plugins:
  - serverless-env-generator
  - serverless-offline

# Plugin config goes into custom:
custom:
  envFiles: #YAML files used to create .env file
    - environment.yml
```

then Add a route to `hello` function (:warning: indentation is important)
```yaml
functions:
  hello:
    handler: handler.hello
    events: # The Events that trigger this Function
      - http: # This creates an API Gateway HTTP endpoint which can be used to trigger this function.  Learn more in "events/apigateway"
          path: hello # Path for this endpoint
          method: get # HTTP method for this endpoint
```

Create environment.yml file

    $ serverless env --attribute OCD_API_KEY --value <YOUR-OPEN-CAGE-API-KEY> --stage dev

```shell
Serverless: Successfuly set OCD_API_KEY 🎉
```

don't forget for the production environment to add the according stage

    $ serverless env --attribute OCD_API_KEY --value <YOUR-OPEN-CAGE-API-KEY> --stage prod

generate env file

```shell
$ serverless env generate
Serverless: Creating .env file...
```    

Quick test

```shell
$ sls offline start
Serverless: Starting Offline: dev/us-east-1.

Serverless: Routes for hello:
Serverless: GET /hello

Serverless: Offline listening on http://localhost:3000
```

open your browser with : http://localhost:3000/hello

the result payload is :
```JSON
{"message":"Go Serverless v1.0! Your function executed successfully!","input":{"headers":{"Host":"localhost:3000","Connection":"keep-alive","Upgrade-Insecure-Requests":"1","User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36","Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8","Accept-Encoding":"gzip, deflate, br","Accept-Language":"en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7","Cookie":"_gauges_unique=1; wp-settings-1=libraryContent%3Dbrowse; wp-settings-time-1=1506863507; _ga=GA1.1.885111529.1449409931"},"path":"/hello","pathParameters":null,"requestContext":{"accountId":"offlineContext_accountId","resourceId":"offlineContext_resourceId","apiId":"offlineContext_apiId","stage":"dev","requestId":"offlineContext_requestId_","identity":{"cognitoIdentityPoolId":"offlineContext_cognitoIdentityPoolId","accountId":"offlineContext_accountId","cognitoIdentityId":"offlineContext_cognitoIdentityId","caller":"offlineContext_caller","apiKey":"offlineContext_apiKey","sourceIp":"127.0.0.1","cognitoAuthenticationType":"offlineContext_cognitoAuthenticationType","cognitoAuthenticationProvider":"offlineContext_cognitoAuthenticationProvider","userArn":"offlineContext_userArn","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36","user":"offlineContext_user"},"authorizer":{"principalId":"offlineContext_authorizer_principalId"},"resourcePath":"/hello","httpMethod":"GET"},"resource":"/hello","httpMethod":"GET","queryStringParameters":null,"stageVariables":null,"body":null,"isOffline":true}}
```

Stop the server with `CTRL + C`

Let's start coding

create a new file

```shell
$ touch opencage.js
```

Edit this file

```javascript
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
  if (typeof process.env.OCD_API_KEY === 'undefined') {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        response: { status: { code: 403, message: 'missing API key' } },
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
      callback(null, {
        statusCode: 400,
        body: JSON.stringify(err),
      });
    });
};
```

edit the `serverless.yml` file adding the following lines alignes with the hello function:
```yml
  geocode:
    handler: opencage.geocode
    events: # The Events that trigger this Function
      - http: # This creates an API Gateway HTTP endpoint which can be used to trigger this function.  Learn more in "events/apigateway"
          path: geocode # Path for this endpoint
          method: get # HTTP method for this endpoint
```
:warning: indentation is important

now test it with

```shell
$ sls offline start

$ curl -i -v "http://localhost:3000/geocode?q=tour%20eiffel"

$ curl -i -v "http://localhost:3000/geocode?q=tour%20eiffel&limit=3&language=fr"
```

### deploy

	$ sls --aws-profile <namedProfile> --stage <stage> deploy

for instance `$ sls --aws-profile tsamaya --stage dev deploy`

```shell
Serverless: Creating .env file...
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Removed .env file
Serverless: Creating Stack...
Serverless: Checking Stack create progress...
.....
Serverless: Stack create finished...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service .zip file to S3 (1.65 MB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
................................................
Serverless: Stack update finished...
Service Information
service: aws-lambda-opencage-geocoder
stage: dev
region: us-east-1
stack: aws-lambda-opencage-geocoder-dev
api keys:
  None
endpoints:
  GET - https://jvkdf2pe18.execute-api.us-east-1.amazonaws.com/dev/hello
  GET - https://jvkdf2pe18.execute-api.us-east-1.amazonaws.com/dev/geocode
functions:
  hello: aws-lambda-opencage-geocoder-dev-hello
  geocode: aws-lambda-opencage-geocoder-dev-geocode
```

we can now test it:

```shell
$ curl -i -v "https://jvkdf2pe18.execute-api.us-east-1.amazonaws.com/dev/geocode?q=tour%20eiffel"

$ curl -i -v "https://jvkdf2pe18.execute-api.us-east-1.amazonaws.com/dev/geocode?q=tour%20eiffel&limit=3&language=fr"
```

## To go further

we will now add a linter, a code style formatter and some unit tests:

install dev-dependencies

- linter packages
```
$ npm i -D eslint eslint-config-airbnb-base eslint-plugin-import eslint-config-prettier eslint-plugin-jest eslint-plugin-prettier
```

- code formatting helper
```
$ npm i -D prettier
```

- test and coverage
```
$ npm i -D jest codecov
```

first edit the `package.json` file script section

```
"scripts": {
  "codecov": "codecov",
  "coverage": "npm run test && npm run codecov",
  "lint": "eslint .",
  "start": "serverless offline start",
  "pretest": "npm run lint",
  "test": "jest --coverage",
  "test:watch": "npm test -- --watch"
},
```

create an `.eslintignore` file

```
coverage/
temp/
```

create an `.eslintrc.js` file

```javascript
module.exports = {
  extends: ['airbnb-base', 'plugin:jest/recommended', 'plugin:prettier/recommended']
};
```

To avoid linter issues with the `hello` handler, you can delete or at least comment it out. Do not forget to remove on comment also the function part in the `serverless.yml` file.

create an empty `.prettierignore` file

create a `.prettierrc.js` file

```javascript
module.exports = {
  singleQuote: true,
  trailingComma: 'es5'
};
```

*Nb*: without a git pre-commit hook here, the prettier configuration is only useful when your texteditor or IDE is configured to use prettier (see [prettier documentation](https://prettier.io/docs/en/editors.html))

Create two folders : `__tests__` and `__mocks__`

    $ mkdir __tests__ __mocks__

Create a first test file

    $ touch __tests__/integration.spec.js

```javascript
const opencage = require('../opencage');

describe('Integration Tests', () => {
  if (process.env.CI) {
    // skip this test on CI,
    //    then eslint disable line to prevent jest/no-disabled-tests
    test.skip('CI : skipping integration tests'); // eslint-disable-line
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
```

run the tests

    $ npm test

NB: remember to generate the .env file before running the test

```shell
$ npm test

> aws-lambda-opencage-geocoder@1.0.0 pretest /Users/arnaud/projects/github/aws-lambda-opencage-geocoder
> npm run lint


> aws-lambda-opencage-geocoder@1.0.0 lint /Users/arnaud/projects/github/aws-lambda-opencage-geocoder
> eslint .


> aws-lambda-opencage-geocoder@1.0.0 test /Users/arnaud/projects/github/aws-lambda-opencage-geocoder
> jest --coverage

 PASS  __tests__/integration.spec.js
  Integration Tests
    ✓ geocode `Brandenburg Gate` (423ms)
    ✓ geocode `Brandenburg Gate` with pretty (436ms)

-------------|----------|----------|----------|----------|-------------------|
File         |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-------------|----------|----------|----------|----------|-------------------|
All files    |    72.73 |       50 |    66.67 |    72.73 |                   |
 opencage.js |    72.73 |       50 |    66.67 |    72.73 |          12,19,32 |
-------------|----------|----------|----------|----------|-------------------|
Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        2.237s
Ran all test suites.
```

Isn't it great ?

As we disabled the test when running in CI you can imagine we will create test for CI mocking the OpenCage real API request.

    $ touch __mocks__/opencage-api-client.js

```javascript
const opencageAPI = jest.genMockFromModule('opencage-api-client');

const geocode = query =>
  new Promise((resolve, reject) => {
    if (query.q === '52.5162767 13.3777025') {
      resolve({ ok: 'ok' });
    } else if (query.q === 'networkerror') {
      reject(new Error('Mocked error'));
    } else {
      reject(new Error('Unexpected Mocked error'));
    }
  });

opencageAPI.geocode = geocode;

module.exports = opencageAPI;
```

now we will use that mocked module.

    $ touch __tests__/geocode.spec.js

```javascript
const opencage = require('../opencage');

describe('OpenCage Lib suite', () => {
  describe('Mocked Tests', () => {
    beforeAll(() => {
      jest.mock('opencage-api-client');
    });
    afterAll(() => {
      jest.unmock('opencage-api-client');
    });
    test('reverse geocode `Brandenburg Gate`', done => {
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
    test('rejection', done => {
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
```

let's improve the code coverage by adding some rainy tests to `geocode.spec.js` file.

```javascript
describe('Rainy Tests', () => {
  describe('#Query String', () => {
    test('no queryStringParameters', done => {
      const event = {};
      const context = null;
      const callback = (ctx, data) => {
        expect(data).toEqual({
          statusCode: 400,
          body: JSON.stringify({
            error: 400,
            message: "Couldn't read query parameters",
          }),
        });
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
    test('no env var', done => {
      const event = {
        queryStringParameters: { q: 'berlin' },
      };
      const context = null;
      const callback = (ctx, data) => {
        expect(data).toEqual({
          statusCode: 400,
          body: JSON.stringify({
            response: { status: { code: 403, message: 'missing API key' } },
          }),
        });
        done();
      };
      opencage.geocode(event, context, callback);
    });
  });
});
```

now to prevent errors on missing `.env` file, create a dedicated test

    $ touch __tests__/environment.spec.js

```javascript
const dotenv = require('dotenv');

dotenv.config();

describe('Environment VARs suite', () => {
  if (process.env.CI) {
    // skip this test on CI,
    //    then eslint disable line to prevent jest/no-disabled-tests
    test.skip('CI : skipping integration tests'); // eslint-disable-line
    return;
  }
  test('OCD_API_KEY exisits', () => {
    expect(process.env.OCD_API_KEY).toBeTruthy();
  });
});
```

run the tests

```
$ npm test

> aws-lambda-opencage-geocoder@1.0.0 pretest /Users/arnaud/projects/github/aws-lambda-opencage-geocoder
> npm run lint


> aws-lambda-opencage-geocoder@1.0.0 lint /Users/arnaud/projects/github/aws-lambda-opencage-geocoder
> eslint .


> aws-lambda-opencage-geocoder@1.0.0 test /Users/arnaud/projects/github/aws-lambda-opencage-geocoder
> jest --coverage

 PASS  __tests__/geocode.spec.js
 PASS  __tests__/environment.spec.js
 PASS  __tests__/integration.spec.js
-------------|----------|----------|----------|----------|-------------------|
File         |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-------------|----------|----------|----------|----------|-------------------|
All files    |      100 |      100 |      100 |      100 |                   |
 opencage.js |      100 |      100 |      100 |      100 |                   |
-------------|----------|----------|----------|----------|-------------------|

Test Suites: 3 passed, 3 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        1.404s
Ran all test suites.
```

Not to bad ?

I hope you enjoyed this tutorial. Feel free to reach me with whatever channel suits you for comment issue, or coffee!

## Quick start

check the [prerequisite](#Prerequisites) and the [AWS-CLI configuration](#AWS---Credentials)

#### Clone the repo

- clone this repo
- `$ cd path/to/this/repo`

### Setup

    $ npm i

create `environment.yml` file

    $ serverless env --attribute OCD_API_KEY --value <YOUR-OPEN-CAGE-API-KEY> --stage dev

create .env file

    $ env generate


### Running locally

    $ sls offline start

### Local tests

```
$ curl -i -v "http://localhost:3000/geocode?q=berlin"

$ curl -i -v "http://localhost:3000/geocode?q=berlin&limit=3&language=fr"
```

### deploy

    $ sls --aws-profile <namedProfile> --stage <stage> deploy

### display logs


## Resources

- serverless quick start [guide](https://serverless.com/framework/docs/providers/aws/guide/quick-start/)


## Licensing

Licensed under the MIT License

A copy of the license is available in the repository's [LICENSE](LICENSE) file.
