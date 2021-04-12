
// gloabl helper object
pwmanHelpers = {
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
	}
}