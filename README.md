This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

To install npm packages run:

### `npm install`

In the project directory, you can run:

### `npm start`

Add your username and password to log in by running:<br>
### `./start`
This is a python script that will prompt you for username passwords and will actually run the following script behind the scenes: <br>
It runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
After this it also zips the build folder and puts the result in the `dist` folder.<br>
Your app is ready to be deployed!

### `npm run release`

Uses release-it library to release the `dist` folder to github.<br>
A wizard will follow. Usually just choose the defaults everywhere by hitting enter.<br>

## Deployment
**Note: some users might experience some problems for the first deployment on their local machine and maybe some other times as well. Please follow the instructions below!** 

Instructions for first-time deployment, follow these extra steps first before the actual deployment:
- Create a Personal Access Token on GitHub (if you do not have it yet);
- Export your personal GitHub token by running the following command: `$export GITHUB_TOKEN=$your_personal_github_token`;
- Try running this command in your terminal: `ssh -v s-web-ws-d10.external-nens.local`.<br>
If the message in the console is: "Could not resolve hostname: Name or service not known", then edit your resolv.config file as follows:
  + Open resolv.config by running `sudo gedit /etc/resolv.conf`;
  + Add the following contents to the file:<br>
      nameserver 10.80.24.33<br>
	    nameserver 10.80.24.32<br>
	    search nens.local
  + Save and exit the file;  
- Now you are ready to move to the final step of the deployment.
  
For the deployment of frontend repositories we make use of an Ansible script in the lizard-nxt repository.
More information is provided in the readme file of lizard-nxt: https://github.com/nens/lizard-nxt/blob/master/README.rst
Look below the heading "Deployment clients". 


### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
