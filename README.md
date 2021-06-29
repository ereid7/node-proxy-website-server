# Node.js Proxy Web Server for Caching Websites 

## Description
A simple node.js web server which acts as a proxy to any website, and caches its contents. Web server will retrieve contents of a given URL from the original source, and cache the contents in-memory using `node-cache`. Subsequent request to the same URL will return the cached contents insntead of requesting contents from original site.

## Running Web Server
### Arguments:
- `--host` host IP
- `--port` host Port
### Example:
`node webserver.js --host=192.168.1.12 --port=8080`

## Making requests to web server using Curl
`curl http://www.github.com:8080/ereid7/ -H "Host: www.github.com" --resolve www.github.com:8080:192.168.1.12`

## NPM Dependencies
- [node-cache](https://www.npmjs.com/package/node-cache)
- [axios](https://www.npmjs.com/package/axios)
- [minimist](https://www.npmjs.com/package/minimistgith)