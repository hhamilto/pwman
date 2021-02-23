
const MINUTE_MILLIS = 60 * 1000;
const TOKEN_EXPIRATION_MILLIS = 15 * MINUTE_MILLIS
const SERVER_BASE_URI = 'http://localhost:3000'

// FIXME try/catch for http status/network errors?

window.addEventListener('DOMContentLoaded', (event) => {
	const screenEls = document.querySelectorAll('.screen')
	const autoFill = async () => {
		const [currentTab] = await browser.tabs.query({
			currentWindow: true,
			active: true
		});
		const url = await browser.tabs.sendMessage(
			currentTab.id,
			{
				action: "fetch url"
			}
		)
		const parsedURL = new URL(url)
		const origin = parsedURL.origin
		document.querySelector('#add-item .website').value = origin

		const username = await browser.tabs.sendMessage(
			currentTab.id,
			{
				action: "fetch username"
			}
		)
		document.querySelector('#add-item .username').value = username

		const password = await browser.tabs.sendMessage(
			currentTab.id,
			{
				action: "fetch password"
			}
		)
		document.querySelector('#add-item .password').value = password
	}
	const fetchItems = async () => {
		const url = await browser.tabs.sendMessage(
			currentTab.id,
			{
				action: "fetch url"
			}
		)
		const parsedURL = new URL(url)
		const origin = parsedURL.origin
		const respRaw = await fetch(SERVER_BASE_URI + '/items?website='+encodeURIComponent(origin), {
			method: "GET",
			headers: {
				"Content-type": "application/json; charset=UTF-8",
				"Authorization": "Bearer "+token
			}
		});
		const tokenInfo = await respRaw.json();
	}

	const showScreen = (id) => {
		for (let i = 0; i < screenEls.length; i++) {
			if (screenEls[i].id == id) {
				screenEls[i].classList.remove('hidden')
			} else {
				screenEls[i].classList.add('hidden')
			}
		}
		if (id == 'add-item') {
			autoFill()
		}
		if (id == 'main-menu') {
			fetchItems()
		}
	}

	const createDevice = async ({username, password}) => {
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
		});
		return respRaw.json();
	}

	const fetchToken = async ({deviceId, secret}) => {
		const respRaw = await fetch(SERVER_BASE_URI + '/devices/'+encodeURIComponent(deviceId)+'/sessions', {
			method: "POST",
			body: JSON.stringify({
				deviceSecret: secret
			}),
			headers: {"Content-type": "application/json; charset=UTF-8"}
		});
		const tokenInfo = await respRaw.json();
		token = tokenInfo.token
		expiration = tokenInfo.tokenExpiration
		await browser.storage.local.set({
			token: tokenInfo.token,
			tokenExpiration: tokenInfo.tokenExpiration,
		});
	}

	// Global State
	let deviceId = null;
	let secret = null;
	let token = null;
	let expiration = null;

	// Set up all events
	// LOGIN
	document.querySelector('#login form').addEventListener('submit', async (e) => {
		e.preventDefault()
		const username = document.querySelector('#login .username').value
		const password = document.querySelector('#login .password').value
		if (!deviceId || !secret) {
			const createDeviceResp = await createDevice({
				username,
				password
			})
			await browser.storage.local.set({
				deviceId: createDeviceResp.deviceId,
				secret: createDeviceResp.deviceSecret
			});
			deviceId = createDeviceResp.deviceId
			secret = createDeviceResp.deviceSecret
		}
		// Warning mutates global state
		await fetchToken({
			deviceId,
			secret
		})
		showScreen('main-menu')
	})
	// MAIN MENU
	document.querySelector('#main-menu button.logout').addEventListener('click', async (e) => {
		e.preventDefault()
		await browser.storage.local.set({
			deviceId: null,
			secret: null,
			token: null
		});
		deviceId = null
		secret = null
		token = null
		showScreen('login')
	})
	document.querySelector('#main-menu button.add-item').addEventListener('click', async (e) => {
		e.preventDefault()
		showScreen('add-item')
	})
	// ADD ITEM
	document.querySelector('#add-item form').addEventListener('submit', async (e) => {
		e.preventDefault()
		const username = document.querySelector('#add-item .username').value
		const password = document.querySelector('#add-item .password').value
		const website = document.querySelector('#add-item .website').value
		const respRaw = await fetch(SERVER_BASE_URI + '/items', {
			method: "POST",
			body: JSON.stringify({
				item: {
					username,
					password,
					website,
				},
				deviceId,
				token
			}),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
				"Authorization": "Bearer "+token
			}
		});
		const resp = await respRaw.json();
		showScreen('main-menu')
	});

	// Startup
	!(async () => {
		const credentials = await browser.storage.local.get(['deviceId', 'secret', 'token', 'expiration']);
		deviceId = credentials.deviceId
		secret = credentials.secret
		token = credentials.token
		expiration = luxon.DateTime.fromISO(credentials.expiration)
		if (!deviceId) {
			// is not logged in
			showScreen('login')
			return
		}
		if (!secret) {
			// is not logged in
			showScreen('login')
			return
		}
		if (!token || expiration < luxon.DateTime.utc()) {
			// warning mutates global state
			await fetchToken({
				deviceId,
				secret
			})
		}
		// TODO session expiration/ renewal
		// is logged in
		showScreen('main-menu')
	})()
});