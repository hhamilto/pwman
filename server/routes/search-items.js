const db = require("../db")
const logger = require('../logger')

module.exports = (req, res) => {
	// TODO: limit result size
	let query = `
		WITH secure_items_websites AS (
		  SELECT
		    s1.*,
		    t1.*
		  FROM secure_items s1,
		  JSON_TABLE(s1.item, '$.website[*]' COLUMNS (website VARCHAR(50) PATH '$')) t1
		)
		SELECT
		  s.public_id,
		  s.item,
		  s.website
		FROM secure_items_websites s
		JOIN
		  users u ON u.id = s.owning_user_id
		WHERE
		  u.id = ?
		`
	const params = [res.locals.user.id]
	if (req.query.website) {
		if (req.query.fuzzy == 'true') {
			const sqlLike = '%' + req.query.website + '%'
			query += `
				AND s.website LIKE ?`
			params.push(sqlLike)
		} else {
			query += `
				AND s.website = ?`
			params.push(req.query.website)
		}
	}
	query += 'LIMIT 100'
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