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
	'input[id*="usrname" i]'
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
			usernameEl.focus()
			usernameEl.value = message.item.username
			usernameEl.click()
			let changeEvent = new Event('change', {
				bubbles: true,
				cancelable: true,
			});
			usernameEl.dispatchEvent(changeEvent);
			let inputEvent = new Event('input', {
				bubbles: true,
				cancelable: true,
			});
			usernameEl.dispatchEvent(inputEvent);
			usernameEl.blur()
		}

		let passwordEl
		for (let i = 0; i < passwordSelectors.length; i++) {
			passwordEl = document.querySelector(passwordSelectors[i])
			if (passwordEl) {
				break
			}
		}
		if (passwordEl) {
			passwordEl.focus()
			passwordEl.value = message.item.password
			passwordEl.click()
			let changeEvent = new Event('change', {
				bubbles: true,
				cancelable: true,
			});
			passwordEl.dispatchEvent(changeEvent);
			let inputEvent = new Event('input', {
				bubbles: true,
				cancelable: true,
			});
			passwordEl.dispatchEvent(inputEvent);
			passwordEl.blur()
		}
		console.log("filled!")
	} else {
		console.log('unrecognized action', message)
	}
})