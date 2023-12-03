[![build](https://github.com/PH1P5/cctron/actions/workflows/build_release.yml/badge.svg)](https://github.com/PH1P5/cctron/actions/workflows/build_release.yml)

# cctron

A cross-platform client which translates [CCTray Specification](https://cctray.org/v1/) into a great developer experience. It is powered by [Electron.js](https://www.electronjs.org/de/). 

## preconditions

* For development and local usage, this project requires node >=18 and yarn.
* Configure your server by clicking `open config editor` in the menu
* Example config.json:

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
```

## run with Basic Auth
* put the credentials to the clipboard in this format (without the quotes) "username:password" 
* press `retrieve credentials from clipboard` in the menu.


## some additional notes

* for now this client only implements a minimal feature set e.g.:
  * only supports one Project per feed (this will change soon)
  * no configuration ui
  * ...
* more documentation may follow
