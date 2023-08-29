# cctron

A cross-platform client which translates [CCTray Specification](https://cctray.org/v1/) into a great developer experience. It is powered by [Electron.js](https://www.electronjs.org/de/). 

## preconditions

* For development and local usage, this project requires node >=18 and yarn.
* Configure your server urls in the `config.json` like shown below:

```json
[
  {
    "url": "https://your-ci-cd.service/feed-location"
  },
  {
    "url": "https://your-ci-cd.service/feed-location",
    "authRequired": true
  },
  ...
]
```
(list of [servers](https://cctray.org/servers/))

## how to use it

```bash
# install dependencies
yarn install

# run the app
yarn start

# Run with Basic Auth
UN='your_username' PW='your_password' yarn start
```

## some additional notes

* for now this client only implements a minimal feature set e.g.:
  * only supports one Project per feed (this will change soon)
  * no configuration ui
  * ...
* more documentation may follow