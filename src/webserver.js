const http = require("http")
const axios = require("axios")
const NodeCache = require( "node-cache" )

// parse arguments --host and --port
var argv = require('minimist')(process.argv.slice(2))

const host = argv.host
const port = argv.port

// create new cache store
const webCache = new NodeCache()

const requestListener = async (req, res) => {
    res.setHeader("Content-Type", "text/html")
    const url = `http://${req.headers.host}${req.url}`
    status = 200;

    // get cached content for url
    responseData = webCache.get(url)

    // retrieve contents of the url if not cached
    if (responseData === undefined) {
        console.log(`Content for ${url} not cached. Fetching content.`)

        await axios.get(url)
            .then((content) => {
                responseData = content.data
                webCache.set(url, responseData)
                console.log(`Successfully cached content at ${url}`)
            })
            .catch((error) => {
                errorObj = {
                    status: error.response.status,
                    statusText: error.response.statusText
                }
                responseData = `Failed to fetch content for url ${url}. ${JSON.stringify(errorObj)}`
                console.log(responseData)

                status = error.response.status
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