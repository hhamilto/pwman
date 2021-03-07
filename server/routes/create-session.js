const db = require("../db")
const bcrypt = require("bcrypt")
const logger = require('../logger')
const crypto = require('crypto')
const { DateTime } = require("luxon")

module.exports = (req, res) => {
	if (!req.body.deviceSecret) {
		logger.debug('missing deviceSecret')
		res.status(400).json({
			error: 'Please specify a deviceSecret key in the body'
		})
		return
	}
	db.query('SELECT secret, id FROM devices WHERE public_id = ?', req.params.deviceId, (err, results) => {
		if (err) {
			logger.error('Could not create session: error finding device: ' + err.message)
			return res.status(500).json({error: 'internal server error'})
		}
		if (!results.length) {
			return res.status(401).json({error: 'incorrect device secret'})
		}
		const hash = results[0].secret
		const deviceId = results[0].id
		bcrypt.compare(req.body.deviceSecret, hash, function(err, doesSecretMatch) {
			if (err) {
				logger.error('Could not create session: could not compare password: ' + err.message)
				return res.status(500).json({error: 'internal server error'})
			}
			if (!doesSecretMatch) {
				return res.status(401).json({error: 'incorrect device secret'})
			}
			// Note: generate a session token
			crypto.randomBytes(48, function(err, buffer) {
				if (err) {
					logger.error('Could not create session: could not create secret: ' + err.message)
					return res.status(500).json({error: 'internal server error'})
				}
				var token = buffer.toString('hex')
				const tokenExpiration = DateTime.utc().plus({
					minutes: 60
				})
				db.query('UPDATE devices SET session_token = ?, token_expiration = ? WHERE id = ?', [token, tokenExpiration.toJSDate(), deviceId], (err) => {
					if (err) {
						logger.error('Could not create session: could update db: ' + err.message)
						return res.status(500).json({error: 'internal server error'})
					}
					res.status(201).json({
						token,
						tokenExpiration: tokenExpiration.toISO()
					})
				})
			})
		})
	})
}