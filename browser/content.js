// let myPort = browser.runtime.connect({
// 	name: "tabs-connect-example"
// });

// myPort.postMessage({greeting: "hello from content script"});

const userNameSelectors = [
	'input[type="email"]',
	'input[placeholder*="email"] i'
]

const passwordSelectors = [
	'input[type="password"]'
]

browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if (message.action == 'fetch url') {
		sendResponse(''+window.location)
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
	} else {
		console.log('unrecognized action', m)
	}
	// console.log("In content script, received message from background script: ");
	// console.log(m);
});