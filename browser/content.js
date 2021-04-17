/* eslint-disable no-console */
// TODO ^ logger maybe?
const userNameSelectors = [
	'input[type="email" i]',
	'input[placeholder*="email" i]',
	'input[placeholder*="User ID" i]',
	'input[id*="userid" i]',
	'input[name="user_id" i]',
	'input[name="userid" i]'
	'input[id*="user" i]',
]

const passwordSelectors = ['input[type="password"]']

browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if (message.action == 'fetch url') {
		sendResponse(String(window.location))
	} else if (message.action == 'fetch username') {
		for (let i = 0; i < userNameSelectors.length; i++) {
			const els = document.querySelectorAll(userNameSelectors[i])
			console.log(els)
			for (let j = 0; j < els.length; j++) {
				if (els[j].value) {
					sendResponse(els[j].value)
					return
				}
			}
		}
	} else if (message.action == 'fetch password') {
		for (let i = 0; i < passwordSelectors.length; i++) {
			const els = document.querySelectorAll(passwordSelectors[i])
			console.log(els)
			for (let j = 0; j < els.length; j++) {
				if (els[j].value) {
					sendResponse(els[j].value)
					return
				}
			}
		}
	} else if (message.action == 'fill item') {
		let usernameEl
		for (let i = 0; i < userNameSelectors.length; i++) {
			usernameEl = document.querySelector(userNameSelectors[i])
			if (usernameEl) {
				break
			}
		}
		if (usernameEl) {
			usernameEl.value = message.item.username
		}

		let passwordEl
		for (let i = 0; i < passwordSelectors.length; i++) {
			passwordEl = document.querySelector(passwordSelectors[i])
			if (passwordEl) {
				break
			}
		}
		if (passwordEl) {
			passwordEl.value = message.item.password
		}
	} else {
		console.log('unrecognized action', message)
	}
})