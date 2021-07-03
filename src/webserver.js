const http = require("http")
const axios = require("axios")
const NodeCache = require( "node-cache" )

// parse arguments --host, --port, and --ttl
var argv = require('minimist')(process.argv.slice(2))

const host = argv.host
const port = argv.port
const ttl = argv.ttl

// create new cache store
const webCache = new NodeCache({ stdTTL: ttl })

const requestListener = async (req, res) => {
    res.setHeader("Content-Type", "text/html")
    const url = `https://${req.headers.host}${req.url}`
    status = 200;

    // parse custom headers
    clearAll = req.headers.clearall
    clear = req.headers.clear

    // if clearAll passed, flush cache
    if (clearAll !== undefined && clearAll) {
        console.log("Flushing cache")
        webCache.flushAll()
    }

    // if clear passed, flush cache for given url
    if (clear !== undefined && clear) {
        console.log(`Clearing cache for url: ${url}`)
        webCache.del(url)
    }

    // get cached content for url
    responseData = webCache.get(url)

    // retrieve contents of the url if not cached
    if (responseData === undefined) {
        console.log(`Content for ${url} not cached. Fetching content.`)

        await axios.get(url)
            .then((content) => {
                responseData = content.data
                cacheContent = true
                cacheTtl = ttl

                cacheControl = content.headers['cache-control']
                if (cacheControl !== undefined) {
                    console.log("URL contains cache-control header")
                    cacheObjs = cacheControl.split(',')
                    maxAge = undefined
                    noCache = undefined

                    cacheObjs.forEach((value) => {
                        // if header includes max-age, set this as the ttl
                        if (value.includes('max-age')) {
                            maxAge = value.substr(value.indexOf("=") + 1, value.length)
                        }
                        // if header includes no-cache, do not cache the website content
                        if (value.includes('no-cache')) {
                            noCache = true
                        }
                    })

                    if (noCache !== undefined) {
                        console.log("cache-control contains no-cache")
                        cacheContent = false;
                    } else if (maxAge !== undefined) {
                        console.log(`cache-control has max age of ${maxAge}`)
                        cacheTtl = maxAge
                    }
                }

                if (cacheContent) {
                    webCache.set(url, responseData, cacheTtl)
                    console.log(`Successfully cached content at ${url}`)
                }
            })
            .catch((error) => {
                errorObj = undefined
                status = 400
                if (error.response.status !== undefined && error.response.statusText !== undefined) {
                    errorObj = {
                        status: error.response.status,
                        statusText: error.response.statusText
                    }
                }

                responseData = `Failed to fetch content for url ${url}. ${JSON.stringify(errorObj)}`
                console.log(responseData)
                console.log(error)
            })
    } else {
        console.log(`Content for ${url} exists in cache. Returning cached content.`)
    }

    res.writeHead(status)
    res.end(responseData)
}

const server = http.createServer(requestListener)
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`)
})