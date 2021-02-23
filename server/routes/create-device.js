const db = require("../db")
const bcrypt = require("bcrypt")
const logger = require('../logger')
const crypto = require('crypto')
const { v4: uuid } = require('uuid');

module.exports = (req, res) => {
	if (!req.body.password) {
		res.status(400).json({
			error: 'Please specify a password key in the body'
		})
		return;
	}
	if (!req.body.username) {
		res.status(400).json({
			error: 'Please specify a username key in the body'
		})
		return;
	}
	if (!req.body.deviceDescription) {
		res.status(400).json({
			error: 'Please specify a deviceDescription key in the body'
		})
		return;
	}
	const saltRounds = 11
	db.query('SELECT password, id FROM users WHERE username = ?', req.body.username, (err, results) => {
		if (err) {
			logger.error('Could not create device: error finding user: ' + err.message)
			return res.status(500).json({'error': 'internal server error'})
		}
		if (!results.length) {
			return res.status(401).json({'error': 'incorrect username/password combo'})
		}
		const hash = results[0].password
		const userId = results[0].id
		bcrypt.compare(req.body.password, hash, function(err, doesPasswordMatch) {
			if (err) {
				logger.error('Could not create user: could not compare password: ' + err.message)
				return res.status(500).json({'error': 'internal server error'})
			}
			if (!doesPasswordMatch) {
				return res.status(401).json({'error': 'incorrect username/password combo'})
			}
			// Note: generate a device id and secret
			const deviceId = uuid()
			crypto.randomBytes(48, function(err, buffer) {
				if (err) {
					logger.error('Could not create device: could not create secret: ' + err.message)
					return res.status(500).json({'error': 'internal server error'})
				}
				var deviceSecret = buffer.toString('hex');
				const saltRounds = 10
				bcrypt.hash(deviceSecret, saltRounds, function(err, deviceSecretHash) {
					if (err) {
						logger.error('Could not create device: could not hash secret: ' + err.message)
						return res.status(500).json({'error': 'internal server error'})
					}
					db.query(
						'INSERT INTO devices (user_id, public_id, secret, description) VALUES (?, ?, ?, ?)',
						[userId, deviceId, deviceSecretHash, JSON.stringify(req.body.deviceDescription)],
						function (err, results, fields) {
							if (err) {
								logger.error('Could not create device: could not insert: ' + err.message)
								return res.status(500).json({'error': 'internal server error'})
							}
							res.status(201).json({
								deviceId,
								deviceSecret
							})
						}
					);
				});
			});
		});
	})
}