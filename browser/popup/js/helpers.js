// init
pwman = {}
pwman.screens = {}
pwman.credentials = {
	deviceId: null,
	secret: null,
	token: null,
	tokenExpiration: null,
}
// gloabl helper object
pwman.helpers = {
	guessItemFromPage: async () => {
		const [currentTab] = await browser.tabs.query({
			currentWindow: true,
			active: true
		})
		const url = await browser.tabs.sendMessage(
			currentTab.id,
			{
				action: "fetch url"
			}
		)
		const parsedURL = new URL(url)
		const {origin} = parsedURL
		document.querySelector('#add-item .website').value = origin

		const username = await browser.tabs.sendMessage(
			currentTab.id,
			{
				action: "fetch username"
			}
		)
		if (username) {
			document.querySelector('#add-item .username').value = username
		}

		const password = await browser.tabs.sendMessage(
			currentTab.id,
			{
				action: "fetch password"
			}
		)
		if (password) {
			document.querySelector('#add-item .password').value = password
		}
	},
	createDevice: async ({username, password}) => {
		const respRaw = await fetch(SERVER_BASE_URI + '/devices', {
			method: "POST",
			body: JSON.stringify({
				username,
				password,
				deviceDescription: {
					userAgent: navigator.userAgent
				}
			}),
			headers: {"Content-type": "application/json; charset=UTF-8"}
		})
		return respRaw.json()
	},
	fetchToken: async ({deviceId, secret}) => {
		const respRaw = await fetch(SERVER_BASE_URI + '/devices/' + encodeURIComponent(deviceId) + '/sessions', {
			method: "POST",
			body: JSON.stringify({
				deviceSecret: secret
			}),
			headers: {"Content-type": "application/json; charset=UTF-8"}
		})
		const tokenInfo = await respRaw.json()
		pwman.credentials.token = tokenInfo.token
		pwman.credentials.tokenExpiration = tokenInfo.tokenExpiration
		await browser.storage.local.set({
			token: tokenInfo.token,
			tokenExpiration: tokenInfo.tokenExpiration,
		})
	}
}