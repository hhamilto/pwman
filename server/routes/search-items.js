const db = require("../db")
const logger = require('../logger')

module.exports = (req, res) => {
	// TODO: limit result size
	let query = `
		SELECT
		  s.public_id,
		  s.item
		FROM secure_items s
		JOIN users u ON u.id = s.owning_user_id
		WHERE
		  u.id = ? `
	const params = [res.locals.user.id]
	if (req.query.website) {
		query += 'AND JSON_EXTRACT(s.item, "$.website") = ?'
		params.push(req.query.website)
	}
	db.query(query, params, function (err, results) {
		if (err) {
			logger.error('Could not create user: could not insert: ' + err.message)
			return res.status(500).json({error: 'internal server error'})
		}
		try {

			const items = results.map(row => {
				return {
					id: row.public_id,
					item: JSON.parse(row.item)
				}
			})
			res.json({
				items: items
			})
		} catch (e) {
			logger.error('Error parsing secure_items')
			res.status(500).json({error: 'internal server error'})
		}
	})
}