/* eslint-disable no-console */
/*
 * FIXME autofill in bg?
 */

const SERVER_BASE_URI = 'http://localhost:3000'

let IN_BROWSER_TAB = false
// mock browser for testing in browser (where browser won't be defined)
if (typeof browser == 'undefined') {
	IN_BROWSER_TAB = true;
	const IS_LOGGED_IN = true;
	browser = {}
	browser.storage = {}
	browser.storage.local = {}
	browser.storage.local.get = async (key) => {
		// todo -- check what is being gotten if we use localstorage for other stuff
		if (IS_LOGGED_IN) {
			return {
				deviceId: 'foo',
				secret: 'bar',
				token: 'qux',
				tokenExpiration: '2222-01-01'
			}
		}
		return {}
	}
	browser.storage.local.set = async () => {}
	browser.tabs = {}
	browser.tabs.query = async () => {
		return [{
			id: 'baz'
		}]
	}
	browser.tabs.sendMessage = async () => {
		return 'http://localhost'
	}
}

/*
 * FIXME try/catch for http status/network errors?
 * FIXME: refactor for sane code organization
          hi level 
 */
window.addEventListener('DOMContentLoaded', () => {

	// Global State
	let deviceId = null
	let secret = null
	let token = null
	let tokenExpiration = null

	const screenEls = document.querySelectorAll('.screen')

	const fetchItems = async () => {
		if (IN_BROWSER_TAB) {
			// send mock items
			console.log("WARNING USING MOCK ITEMS")
			return [{
				item: {
					username: 'hello',
					password: 'testpw',
					website: 'http://localhost:8080'
				},
				id: 'foo'
			}]
		}
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

	const fillItemOnBrowserPage = async (item) => {
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
				fillItemOnBrowserPage(i.item)
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
		await pwmanHelpers.guessItemFromPage()
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
	document.querySelector('#add-item form .back').addEventListener('click', async (e) => {
		e.preventDefault()
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
	document.querySelector('#edit-item form .back').addEventListener('click', async (e) => {
		e.preventDefault()
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
		if (!token || !credentials.tokenExpiration || tokenExpiration < luxon.DateTime.utc()) {
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