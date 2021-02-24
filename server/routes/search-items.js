const db = require("../db")
const bcrypt = require("bcrypt")
const logger = require('../logger')
const { v4: uuid } = require('uuid');

module.exports = (req, res) => {
	// TODO: limit result size
	let query = `
		SELECT
		  s.public_id,
		  s.item
		FROM secure_items s
		JOIN users u ON u.id = s.owning_user_id
		WHERE
		  u.id = ? `;
	const params = [res.locals.user.id]
	if (req.query.website) {
		query += 'AND JSON_EXTRACT(s.item, "$.website") = ?'
		params.push(req.query.website)
	}
	db.query(query, params, function (err, results) {
		if (err) {
			logger.error('Could not create user: could not insert: ' + err.message)
			return res.status(500).json({'error': 'internal server error'})
		}
		const items = results.map(row => {
			return {
				id: row.public_id,
				// todo parse catch
				item: JSON.parse(row.item)
			}
		})
		console.log('resp', items)
		res.json({
			items: items
		})
	});
}