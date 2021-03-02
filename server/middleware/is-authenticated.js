const db = require("../db")
const logger = require('../logger')

module.exports = (req, res, next) => {
	if (!req.headers.authorization) {
		res.status(400).json({
			error: 'Please specify an authorization header'
		})
		return
	}
	if (!(/Bearer /).test(req.headers.authorization)) {
		res.status(400).json({
			error: 'Malformed authorization header'
		})
		return
	}
	const token = req.headers.authorization.substring('Bearer '.length)
	db.query(
		`SELECT
		  u.username,
		  u.id
		FROM users u
		JOIN devices d ON d.user_id = u.id
		WHERE
		  d.session_token = ?
		  AND d.token_expiration > NOW()`,
		[token],
		function (err, results) {
			if (err) {
				logger.error('Could not authn: could not select: ' + err.message)
				return res.status(500).json({error: 'internal server error'})
			}
			if (!results || !results[0]) {
				return res.status(403).json({
					unauthed: 'yes'
				})
			}
			res.locals.user = {
				username: results[0].username,
				id: results[0].id
			}
			next()
		}
	)
}