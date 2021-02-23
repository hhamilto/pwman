

const levels = [
	'debug',
	'info',
	'error'
];


module.exports = {
	level: 'info'
}

levels.forEach((l, index) => {
	module.exports[l] = (...toLog) => {
		if (levels.indexOf(module.exports.level) > index) {
			// silent
			return
		}
		const timestamp = ''
		if (process.env.SHOW_TIMESTAMP_LOGS) {
			timestamp = new Date().toISOString() + ' ';
		}
		console.log(timestamp + '['+l.toUpperCase() + ']: ', ...toLog)
	}
})