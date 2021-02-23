const express = require('express')
const cors = require('cors')
const isAuthenticated = require("./middleware/is-authenticated")

const logger = require("./logger")
logger.level = 'debug'

const app = express()

if (process.env.DEV_MODE_CORS) {
	app.use(cors())
} else {
	app.use(cors({
		origin: 'moz-extension://6be79846-ee33-44ca-a2d8-nope',
	}))
}

app.use(express.json())

app.use((req, res, next) => {
	logger.debug(req.url, req.body)
	next()
})

app.post('/users', require('./routes/create-user.js'))
app.post('/devices', require('./routes/create-device.js'))
app.post('/devices/:deviceId/sessions', require('./routes/create-session.js'))

app.use(isAuthenticated)

app.post('/items', require('./routes/create-item.js'))
app.get('/items', require('./routes/search-items.js'))

app.listen(process.env.PORT || 3000)