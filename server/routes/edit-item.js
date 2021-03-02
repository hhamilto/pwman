const db = require("../db")
const logger = require('../logger')

module.exports = (req, res) => {
	if (!req.body.item) {
		res.status(400).json({
			error: 'Please specify a item key in the body'
		})
		return
	}
	db.query(
		`UPDATE secure_items SET item = ? WHERE public_id = ? AND owning_user_id = ?`,
		[JSON.stringify(req.body.item), req.params.itemId, res.locals.user.id],
		function (err) {
			if (err) {
				logger.error('Could not update item: could not update: ' + err.message)
				return res.status(500).json({error: 'internal server error'})
			}
			res.status(200).json({success:true})
		}
	)
}