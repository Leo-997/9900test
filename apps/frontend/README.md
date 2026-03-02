# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

# Project Structure

```
src
└── components
└── contexts
└── layouts
└── pages
└── themes
└── utils
└── views
```

#Docker usage guide -------------------------
First install the docker in your machine.

How to build front-end image for production deployment---
docker build -f Dockerfile.prod -t zerod-prodf .

Then run the docker image in given vps.

Build docker image for dev environment---
docker build -t zerod-front .
docker run -d -p <port on host>:<port on container> -v %cd%:/app <image name>
docker run -d -p 3000:3000 -v $(pwd):/app react-app

To see and follow the logs
docker logs -f <container id>
