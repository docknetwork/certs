Certs Express & ES6 REST API
==================================

This is a straightforward boilerplate for building REST APIs with ES6 and Express.

- ES6 support via [babel](https://babeljs.io)
- REST resources as middleware via [resource-router-middleware](https://github.com/developit/resource-router-middleware)
- CORS support via [cors](https://github.com/troygoode/node-cors)
- Body Parsing via [body-parser](https://github.com/expressjs/body-parser)


Getting Started
---------------

```sh
# clone it
git clone git@github.com:developit/express-es6-rest-api.git
cd express-es6-rest-api

# Make it your own
rm -rf .git && git init && npm init

# Install dependencies
npm install

# Start development live-reload server
PORT=8080 npm run dev

# Start production server:
PORT=8080 npm start
```

Configuring credentials
-----------------------
This API uses both the Google Sheets API and the AWS SDK, for writing onboarding information and for sending emails respectively. You must download your Google API credentials and add `credentials.json` into the `/api/` directory of this project. You also need to make sure that you have AWS credentials on your system. See:
- https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html
- https://developers.google.com/sheets/api/quickstart/nodejs

Docker Support
------
```sh
cd express-es6-rest-api

# Build your docker
docker build -t es6/api-service .
#            ^      ^           ^
#          tag  tag name      Dockerfile location

# run your docker
docker run -p 8080:8080 es6/api-service
#                 ^            ^
#          bind the port    container tag
#          to your host
#          machine port   

```
