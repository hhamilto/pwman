const userNameSelectors = [
	'input[type="email" i]',
	'input[placeholder*="email" i]',
	'input[placeholder*="User ID" i]',
	'input[id*="userid" i]'
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
					return;
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
					return;
				}
			}
		}
	} else if (message.action == 'fill item') {
		console.log('wtg')
		console.log('message', message)
		// todo -- store selectors too?
		let usernameEl;
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
		console.log("passwordEl?")
		if (passwordEl) {
			passwordEl.value = message.item.password
		}
	} else {
		console.log('unrecognized action', message)
	}

	/*
	 * console.log("In content script, received message from background script: ");
	 * console.log(m);
	 */
});