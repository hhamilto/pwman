

const levels = [
	'info',
	'error'
];


module.exports = {}

levels.forEach(l => {
	module.exports[l] = (...toLog) => {
		const timestamp = ''
		if (process.env.SHOW_TIMESTAMP_LOGS) {
			timestamp = new Date().toISOString() + ' ';
		}
		console.log(timestamp + '['+l.toUpperCase() + ']: ', ...toLog)
	}
})