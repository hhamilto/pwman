const express = require('express')
const cors = require('cors')
const isAuthenticated = require("./middleware/is-authenticated")

const logger = require("./logger")
logger.level = process.env.LOG_LEVEL || 'info'

const app = express()

if (process.env.DEV_MODE_CORS) {
	app.use(cors())
} else {
	app.use(cors({
		origin: /^moz-extension:\/\/.*$/,
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
app.put('/items/:itemId', require('./routes/edit-item.js'))

const port = process.env.PORT || 3000
app.listen(port, (err) => {
	if (err) {
		logger.error("Could not listen on port " + port + ": " + err.message)
		return
	}
	logger.info("listening on port " + port)
})