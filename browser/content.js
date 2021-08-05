/* eslint-disable no-console */
// TODO ^ logger maybe?
const userNameSelectors = [
	'input[type="email" i]',
	'input[placeholder*="email" i]',
	'input[placeholder*="User ID" i]',
	'input[id*="userid" i]',
	'input[name="user_id" i]',
	'input[name="userid" i]',
	'input[name="login" i]',
	'input[id*="user" i]',
	'input[id*="username" i]',
	'input[id*="usrname" i]'
]

const passwordSelectors = ['input[type="password"]']

const AUTO_FILL_TIMEOUT_MS = 10 * 1000

;(() => {
	const fillUsername = (username) => {
		const usernameEls = []
		for (let i = 0; i < userNameSelectors.length; i++) {
			const usernameEl = document.querySelector(userNameSelectors[i])
			if (usernameEl) {
				usernameEls.push(usernameEl)
			}
		}
		for (let i = 0; i < usernameEls.length; i++) {
			const usernameEl = usernameEls[i]
			usernameEl.focus()
			usernameEl.value = username
			usernameEl.click()
			const changeEvent = new Event('change', {
				bubbles: true,
				cancelable: true,
			})
			usernameEl.dispatchEvent(changeEvent)
			const inputEvent = new Event('input', {
				bubbles: true,
				cancelable: true,
			})
			usernameEl.dispatchEvent(inputEvent)
			usernameEl.blur()
		}
		// If we found any username elements, then we count as successful fill
		return Boolean(usernameEls.length)
	}

	const fillPassword = (password) => {
		let passwordEl
		for (let i = 0; i < passwordSelectors.length; i++) {
			passwordEl = document.querySelector(passwordSelectors[i])
			if (passwordEl) {
				break
			}
		}
		if (passwordEl) {
			passwordEl.focus()
			passwordEl.value = password
			passwordEl.click()
			const changeEvent = new Event('change', {
				bubbles: true,
				cancelable: true,
			})
			passwordEl.dispatchEvent(changeEvent)
			const inputEvent = new Event('input', {
				bubbles: true,
				cancelable: true,
			})
			passwordEl.dispatchEvent(inputEvent)
			passwordEl.blur()
		}
		// If we found a password element, then we count as successful fill
		return Boolean(passwordEl)
	}
	const fillItem = (item) => {
		let fillAttemptSucceeded = true
		if (item.username) {
			const filledUsername = fillUsername(item.username)
			if (!filledUsername) {
				fillAttemptSucceeded = false
			}
		}
		if (item.password) {
			const filledPassword = fillPassword(item.password)
			if (!filledPassword) {
				fillAttemptSucceeded = false
			}
		}
		return fillAttemptSucceeded
	}

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
			fillItem(message.item)
		} else {
			console.log('unrecognized action', message)
		}
	})

	const requestAutoFill = async () => {
		const items = await browser.runtime.sendMessage({
			action: 'request fill',
			origin: window.location.origin
		})
		if (!items) {
			return
		}
		const autoFillStart = Date.now()
		while (items.length > 0 && Date.now() < autoFillStart + AUTO_FILL_TIMEOUT_MS) {
			for (let i = 0; i < items.length; i++) {
				const gotFilled = fillItem(items[i].item)
				if (gotFilled) {
					// Note: If item was filled successfully, remove from array
					items.splice(i, 1)
				}
			}
			await new Promise(res => setTimeout(res, 500))
		}
	}

	window.addEventListener('DOMContentLoaded', requestAutoFill)
})()