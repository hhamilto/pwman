
const MINUTE_MILLIS = 60 * 1000
const TOKEN_EXPIRATION_MILLIS = 60 * MINUTE_MILLIS
const SERVER_BASE_URI = 'http://localhost:3000'

// warning: coppied from popup js
const fetchToken = async ({deviceId, secret}) => {
	const respRaw = await fetch(SERVER_BASE_URI + '/devices/' + encodeURIComponent(deviceId) + '/sessions', {
		method: "POST",
		body: JSON.stringify({
			deviceSecret: secret
		}),
		headers: {"Content-type": "application/json; charset=UTF-8"}
	})
	return respRaw.json()

}

setInterval(async () => {
	const credentials = await browser.storage.local.get(['deviceId', 'secret', 'token', 'tokenExpiration'])
	const deviceId = credentials.deviceId
	const secret = credentials.secret
	let token = credentials.token
	let tokenExpiration = luxon.DateTime.fromISO(credentials.tokenExpiration)
	if (!deviceId || !secret) {
		return
	}
	if (tokenExpiration > luxon.DateTime.utc().plus({minutes:1})) {
		return
	}
	const tokenInfo = await fetchToken({
		deviceId,
		secret
	})
	token = tokenInfo.token
	tokenExpiration = tokenInfo.tokenExpiration
	await browser.storage.local.set({
		token: tokenInfo.token,
		tokenExpiration: tokenInfo.tokenExpiration,
	})
}, 30 * 1000)