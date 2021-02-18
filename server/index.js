const express = require('express')

const app = express()

app.use(express.json())

app.post('/users', require('./routes/create-user.js'))

// the 'login' route
app.post('/devices', require('./routes/create-device.js'))

app.post('/devices/:deviceId/sessions', require('./routes/create-session.js'))

app.listen(process.env.PORT || 3000)