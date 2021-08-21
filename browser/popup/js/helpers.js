
// todo: logger?
pwman = {}
pwman.screens = {}
pwman.credentials = {
	deviceId: null,
	secret: null,
	token: null,
	tokenExpiration: null,
}

pwman.log = (...args) => {
	// eslint-disable-next-line no-console
	console.log(...args)
}

pwman.constants = {
	SERVER_BASE_URI: 'http://localhost:3000'
}

const IN_BROWSER_TAB = false
// mock browser for testing in browser
if (IN_BROWSER_TAB) {
	const IS_LOGGED_IN = true
	browser = {}
	browser.storage = {}
	browser.storage.local = {}
	browser.storage.local.get = async () => {
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
		let respRaw
		try {
			respRaw = await fetch(pwman.constants.SERVER_BASE_URI + '/devices', {
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
		} catch (e) {
			throw new Error('Could not create device: ' + e.message)
		}
		return respRaw.json()
	},
	fetchToken: async ({deviceId, secret}) => {
		const respRaw = await fetch(pwman.constants.SERVER_BASE_URI + '/devices/' + encodeURIComponent(deviceId) + '/sessions', {
			method: "POST",
			body: JSON.stringify({
				deviceSecret: secret
			}),
			headers: {"Content-type": "application/json; charset=UTF-8"}
		})
		const tokenInfo = await respRaw.json()
		// eslint-disable-next-line require-atomic-updates
		pwman.credentials.token = tokenInfo.token
		// eslint-disable-next-line require-atomic-updates
		pwman.credentials.tokenExpiration = tokenInfo.tokenExpiration
		await browser.storage.local.set({
			token: tokenInfo.token,
			tokenExpiration: tokenInfo.tokenExpiration,
		})
	},
	fetchItemsForCurrentPage: async () => {
		if (IN_BROWSER_TAB) {
			// send mock items
			pwman.log("WARNING USING MOCK ITEMS")
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
		return pwman.helpers.fetchItems({origin})
	},
	fetchItems: async ({origin, fuzzy = false}) => {
		const url = pwman.constants.SERVER_BASE_URI
			+ '/items?website='
			+ encodeURIComponent(origin)
			+ '&fuzzy='
			+ encodeURIComponent(fuzzy)
		const respRaw = await fetch(url, {
			method: "GET",
			headers: {
				"Content-type": "application/json; charset=UTF-8",
				Authorization: "Bearer " + pwman.credentials.token
			}
		})
		const parsedResp = await respRaw.json()
		return parsedResp.items
	},
	// TODO: Tests
	debounce: (timeoutMs, fun) => {
		let timeoutHandle
		return (...args) => {
			if (timeoutHandle) {
				clearTimeout(timeoutHandle)
			}
			timeoutHandle = setTimeout(() => {
				timeoutHandle = null
				fun(...args)
			}, timeoutMs)
		}
	}
}