const db = require("../db")
const bcrypt = require("bcrypt")
const logger = require('../logger')

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
	const saltRounds = 11
	bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
		if (err) {
			logger.error('Could not create user: could not hash password: ' + err.message)
			return res.status(500).json({'error': 'internal server error'})
		}
		db.query('INSERT INTO users (username, password) VALUES (?, ?)', [req.body.username, hash], function (err, results, fields) {
			if (err) {
				logger.error('Could not create user: could not insert: ' + err.message)
				return res.status(500).json({'error': 'internal server error'})
			}
			res.status(201).json({success:true})
		});
	});
}