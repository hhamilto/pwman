
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
	tokenExpiration = tokenInfo.tokenExpiration
	await browser.storage.local.set({
		token: tokenInfo.token,
		tokenExpiration: tokenInfo.tokenExpiration,
	})
}, TOKEN_EXPIRATION_MILLIS - 10 * MINUTE_MILLIS)


browser.runtime.onMessage.addListener(async (message) => {
	if (message.action == 'request fill') {
		pwman.info('about to try to use helpers')
		// TODO: move to common place maybe?
		const storedCredentials = await browser.storage.local.get(['deviceId', 'secret', 'token', 'tokenExpiration'])
		/* eslint-disable require-atomic-updates */
		pwman.credentials.deviceId = storedCredentials.deviceId
		pwman.credentials.secret = storedCredentials.secret
		pwman.credentials.token = storedCredentials.token
		pwman.credentials.tokenExpiration = luxon.DateTime.fromISO(storedCredentials.tokenExpiration)
		const items = await window.pwman.helpers.fetchItemsForOrigin(message.origin)
		pwman.log('returing item:', items)
		return items
	}
	pwman.log('unrecognized message recv by background script')


})