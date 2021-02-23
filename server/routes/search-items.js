const db = require("../db")
const bcrypt = require("bcrypt")
const logger = require('../logger')
const { v4: uuid } = require('uuid');

module.exports = (req, res) => {
	logger.debug("hi")
	if (!req.body.item) {
		res.status(400).json({
			error: 'Please specify a item key in the body'
		})
		return;
	}
	/*
	public_id
item
owning_user_id
*/
	const publicId = uuid()
	db.query(
		'INSERT INTO secure_items (public_id, item, owning_user_id) VALUES (?, ?, ?)',
		[publicId, JSON.stringify(req.body.item), res.locals.user.id],
		function (err, results) {
			if (err) {
				logger.error('Could not create user: could not insert: ' + err.message)
				return res.status(500).json({'error': 'internal server error'})
			}
			res.status(201).json({success:true})
		}
	);
}