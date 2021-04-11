/* eslint-disable no-console */
/*
 * FIXME autofill in bg?
 */

const SERVER_BASE_URI = 'http://localhost:3000'

/*
 * FIXME try/catch for http status/network errors?
 * FIXME: refactor for sane code organization
 */
window.addEventListener('DOMContentLoaded', () => {

	// Global State
	let deviceId = null
	let secret = null
	let token = null
	let tokenExpiration = null

	const screenEls = document.querySelectorAll('.screen')
	const autoFill = async () => {
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
	}

	const fetchItems = async () => {
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
		const respRaw = await fetch(SERVER_BASE_URI + '/items?website=' + encodeURIComponent(origin), {
			method: "GET",
			headers: {
				"Content-type": "application/json; charset=UTF-8",
				Authorization: "Bearer " + token
			}
		})
		const parsedResp = await respRaw.json()
		return parsedResp.items
	}

	const fillItem = async (item) => {
		const [currentTab] = await browser.tabs.query({
			currentWindow: true,
			active: true
		})
		await browser.tabs.sendMessage(
			currentTab.id,
			{
				action: "fill item",
				item
			}
		)
	}

	const showScreen = async (id) => {
		if (id == 'main-menu') {
			let items;
			try {
				items = await fetchItems()
			} catch (e) {
				console.log("Could not fetch items: ", e)
			}
			if (items) {
				renderItems(items)
			}
		}
		for (let i = 0; i < screenEls.length; i++) {
			if (screenEls[i].id == id) {
				screenEls[i].classList.remove('hidden')
			} else {
				screenEls[i].classList.add('hidden')
			}
		}
	}

	function renderItems(items) {
		const currentItemsULEL = document.querySelector('#main-menu .current-items')
		currentItemsULEL.innerHTML = ''
		var itemTemplate = document.querySelector('#item-row')
		items.forEach(i => {
			const liEl = itemTemplate.content.cloneNode(true)
			liEl.querySelector(".website").textContent = i.item.website
			liEl.querySelector(".username").textContent = i.item.username
			liEl.querySelector("button.fill").addEventListener('click', (e) => {
				e.preventDefault()
				fillItem(i.item)
			})
			liEl.querySelector("button.edit").addEventListener('click', async (e) => {
				e.preventDefault()
				await showScreen('edit-item')
				document.querySelector('#edit-item .website').value = i.item.website
				document.querySelector('#edit-item .username').value = i.item.username
				document.querySelector('#edit-item .password').value = i.item.password
				document.querySelector('#edit-item .item-id').value = i.id
			})
			currentItemsULEL.appendChild(liEl)
		})
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
		})
		return respRaw.json()
	}

	const fetchToken = async ({deviceId, secret}) => {
		const respRaw = await fetch(SERVER_BASE_URI + '/devices/' + encodeURIComponent(deviceId) + '/sessions', {
			method: "POST",
			body: JSON.stringify({
				deviceSecret: secret
			}),
			headers: {"Content-type": "application/json; charset=UTF-8"}
		})
		const tokenInfo = await respRaw.json()
		token = tokenInfo.token
		tokenExpiration = tokenInfo.tokenExpiration
		await browser.storage.local.set({
			token: tokenInfo.token,
			tokenExpiration: tokenInfo.tokenExpiration,
		})
	}


	/*
	 * Set up all events
	 * LOGIN
	 */
	document.querySelector('#login form').addEventListener('submit', async (e) => {
		e.preventDefault()
		const showError = (message) => {
			const errorMessageEl = document.querySelector('#login .error')
			errorMessageEl.classList.remove('hidden')
			errorMessageEl.textContent = message
		}
		const username = document.querySelector('#login .username').value
		const password = document.querySelector('#login .password').value
		if (!deviceId || !secret) {
			let createDeviceResp;
			try {
				createDeviceResp = await createDevice({
					username,
					password
				})
			} catch (e) {
				// TODO better message
				showError('Could not create a device: ' + e.message)
				return;
			}
			console.log(createDeviceResp.error)
			if (createDeviceResp.error) {
				showError('Could not login: ' + createDeviceResp.error)
				return;
			}

			await browser.storage.local.set({
				deviceId: createDeviceResp.deviceId,
				secret: createDeviceResp.deviceSecret
			})
			// eslint-disable-next-line require-atomic-updates
			deviceId = createDeviceResp.deviceId
			// eslint-disable-next-line require-atomic-updates
			secret = createDeviceResp.deviceSecret
		}
		// Warning mutates global state
		try {
			await fetchToken({
				deviceId,
				secret
			})
		} catch (e) {
			// TODO better message
			showError('Could not login: ' + e.message)
			return;
		}
		await showScreen('main-menu')
	})
	// MAIN MENU
	document.querySelector('#main-menu button.logout').addEventListener('click', async (e) => {
		e.preventDefault()
		await browser.storage.local.set({
			deviceId: null,
			secret: null,
			token: null
		})
		deviceId = null
		secret = null
		token = null
		await showScreen('login')
	})
	document.querySelector('#main-menu button.add-item').addEventListener('click', async (e) => {
		e.preventDefault()
		await showScreen('add-item')
		await autoFill()
	})
	// ADD ITEM
	document.querySelector('#add-item form').addEventListener('submit', async (e) => {
		e.preventDefault()
		const username = document.querySelector('#add-item .username').value
		const password = document.querySelector('#add-item .password').value
		const website = document.querySelector('#add-item .website').value
		await fetch(SERVER_BASE_URI + '/items', {
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
				Authorization: "Bearer " + token
			}
		})
		await showScreen('main-menu')
	})
	// EDIT ITEM
	document.querySelector('#edit-item form').addEventListener('submit', async (e) => {
		e.preventDefault()
		const username = document.querySelector('#edit-item .username').value
		const password = document.querySelector('#edit-item .password').value
		const website = document.querySelector('#edit-item .website').value
		const itemId = document.querySelector('#edit-item .item-id').value
		await fetch(SERVER_BASE_URI + '/items/' + itemId, {
			method: "PUT",
			body: JSON.stringify({
				item: {
					username,
					password,
					website,
				}
			}),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
				Authorization: "Bearer " + token
			}
		})
		await showScreen('main-menu')
	})

	// Startup
	;(async () => {
		const credentials = await browser.storage.local.get(['deviceId', 'secret', 'token', 'tokenExpiration'])
		deviceId = credentials.deviceId
		secret = credentials.secret
		token = credentials.token
		tokenExpiration = luxon.DateTime.fromISO(credentials.tokenExpiration)
		if (!deviceId) {
			// is not logged in
			await showScreen('login')
			return
		}
		if (!secret) {
			// is not logged in
			await showScreen('login')
			return
		}
		console.log('start up hello')
		console.log(tokenExpiration.toISO())
		console.log(credentials.tokenExpiration)
		if (!token || !credentials.tokenExpiration || tokenExpiration < luxon.DateTime.utc()) {
			console.log("fetching new token")
			// warning mutates global state
			await fetchToken({
				deviceId,
				secret
			})
		}

		/*
		 * TODO session tokenExpiration/ renewal
		 * is logged in
		 */
		await showScreen('main-menu')
	})()
})