# aws-lambda-opencage-geocoder

This repository shows how to create an [AWS lambda](https://aws.amazon.com/lambda/) function to wrap OpenCage Data [Geocoder](https://geocoder.opencagedata.com/) API.

The following how-to section describes step by steps how to create the AWS lambda function using [serverless](https://serverless.com/) and how to deploy it on AWS; then later, the quick start section describes how to just use this repo where the function is ready to use.

## How to create a AWS Lambda function

We will create a Lambda Function using [node](https://nodejs.org/en/) and [serverless](https://serverless.com/framework/docs/) framework.

### Prerequisites

- node, npm or yarn
- aws-cli ?
- serverless: for convienience install it globally  
`$ npm install -g serverless`
or
`$ yarn global add serverless`


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

then Add a route to `hello` function
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

    $ serverless env generate

```shell
Serverless: Creating .env file...
```    

Quick test

	$ sls offline start

```
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



TBC


### Quick deploy

	$ sls deploy


## Resources

- serverless quick start [guide](https://serverless.com/framework/docs/providers/aws/guide/quick-start/)


## Licensing

Licensed under the MIT License

A copy of the license is available in the repository's [LICENSE](LICENSE) file.
