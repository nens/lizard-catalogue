This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

Installation
============

- Required: A working nodejs and yarn installation.
- In the root directory of the repository: `$ yarn install`
- start the app using `$ yarn start`
- By default, the proxy sends requests to https://nxt3.staging.lizard.net/
  (for selected URLs), without authentication.
- Set up proxy and basic authentication by following the steps [here](./BASIC_AUTH.md)
- start the app by running one of (depending on your choice in previous step):

`yarn start`
or
`PROXY_URL=https://nxt3.staging.lizard.net/ PROXY_API_KEY=123456789STAGINGKEY yarn start`
or
`yarn run startauth`

Installation problems
=====================

- in case you run into the following error:
postcss@8.2.1: The engine "node" is incompatible with this module. Expected version "^10 || ^12 || >=14". Got "13.7.0"
Use nvm to use nodeJS version 12:
`$ nvm install 12`
`$ nvm use 12`

Production bundle
=================

Run `$ yarn build` and look in the `build/` folder.


Releasing
=========

Run `$ yarn run release` and answer the questions accordingly.


Deployment
=========

For the deployment of frontend repositories we make use of an Ansible script in the lizard-nxt repository.
More information is provided in the readme file of lizard-nxt: https://github.com/nens/lizard-nxt/blob/master/README.rst
Look below the heading "Deployment clients".

**Note: some users might experience some problems for the first deployment on their local machine and maybe some other times as well. Please follow the instructions below!** 

Instructions for first-time deployment, follow these extra steps first before the actual deployment:
- Create a Personal Access Token on GitHub (if you do not have it yet);
- Export your personal GitHub token by running the following command: `export GITHUB_TOKEN=$your_personal_github_token`;
- Try running this command in your terminal: `ssh -v s-web-ws-d10.external-nens.local`.<br>
If the message in the console is: "Could not resolve hostname: Name or service not known", then edit your resolv.config file as follows:
  + Open resolv.config by running `sudo gedit /etc/resolv.conf`;
  + Add the following contents to the file:<br>
      nameserver 10.80.24.33<br>
	    nameserver 10.80.24.32<br>
	    search nens.local
  + Save and exit the file;  
- Now you are ready to move to the final step of the deployment.

Redux
=====

Redux is used for the app-wide notification system.


React-router
============

React-router is used for the URL setup.


Sentry
======

To be written...


Browser development extensions
==============================

These extensions may help:

- React Devtools for [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en) or [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

- Redux Devtools for [Chrome](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en) or [Firefox](https://addons.mozilla.org/en-Gb/firefox/addon/remotedev/)
