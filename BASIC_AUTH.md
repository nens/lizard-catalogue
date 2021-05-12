Basic authentication
====================

For basic authentication you can choose from following 3 options:

1 command line
===============

Instead of `yarn start` run:   
`PROXY_URL=https://nxt3.staging.lizard.net/ PROXY_API_KEY=123456789STAGINGKEY yarn start`  
  
but replace `123456789STAGINGKEY` with a key you created with [api-key-management-page](https://nxt3.staging.lizard.net/management/#/personal_api_keys)  

2 Set default environments variables system wide 
=================================================

(for now this description works for ubuntu only, if you got this working on windows, please open a pr)

In your `~/.bashrc` file add the following lines:

`export LIZARD_URL='https://parramatta.lizard.net/'`   
`export LIZARD_API_KEY=123456789STAGINGKEY`  
`export PROXY_URL='https://nxt3.staging.lizard.net/'`  
`export PROXY_API_KEY=123456789PRODKEY`  

But change the `123456789STAGINGKEY` with a key you created with [api-key-management-page](https://nxt3.staging.lizard.net/management/#/personal_api_keys).  
Also change the `123456789PRODKEY` with a key you created with [production_api-key-management-page](https://demo.lizard.net/management/#/personal_api_keys). 

3 startauth.sh file in this repo
================================= 

- Copy the file `./startauth.sh.example` and call the copy `./startauth.sh`  
- In your new startauth.sh file replace the key `123456789STAGINGKEY` with a key you created with [api-key-management-page](https://nxt3.staging.lizard.net/management/#/personal_api_keys)
- now instead of `yarn start` run `yarn run startauth`

Alternatively you can uncomment one of the other lines in `startauth.sh` to proxy to production or other domains.  
To whoever it concerns: the file `startauth.sh` is added to .gitignore.  

Advanced usage explanation
==========================

In order for the app to work it needs data from staging or production.
We solve this with a proxy server in the file `./src/setupProxy.js` 
Also you need to be authenticated.

The proxy and authentication depends on the following 3 environment variables

`PROXY_PREFIX` # defaults to `PROXY`  
`${PROXY_PREFIX}_URL` # defaults to `https://nxt3.staging.lizard.net/`  
`${PROXY_PREFIX}_API_KEY` # has no default  

The last 2 of these environment variables names depend on the value of the first one.  
Since `PROXY_PREFIX` defaults to 'PROXY' the default names of the last 2 environment variables are `PROXY_URL` and `PROXY_API_KEY`.  

The `PROXY_PREFIX` can be used to set a key for production, to use different  
Lizard portals in different situations, or to not use a key at all  
by setting a nonexisting prefix (`PROXY_PREFIX=NONE yarn start`).  

Running unauthenticated
=======================

Sometimes you need to test what happens when a user is not authenticated.  
This can be done by explicitly setting the api key as an empty string.  
  
For example:  
`PROXY_URL=https://nxt3.staging.lizard.net/ PROXY_API_KEY= yarn start`