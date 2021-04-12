pwman.screens.mainMenu = {}
pwman.screens.mainMenu.setup = () => {
	document.querySelector('#main-menu button.logout').addEventListener('click', async (e) => {
		e.preventDefault()
		await browser.storage.local.set({
			deviceId: null,
			secret: null,
			token: null
		})
		pwman.credentials.deviceId = null
		pwman.credentials.secret = null
		pwman.credentials.token = null
		await pwman.showScreen('login')
	})
	document.querySelector('#main-menu button.add-item').addEventListener('click', async (e) => {
		e.preventDefault()
		await pwman.showScreen('add-item')
		await pwman.helpers.guessItemFromPage()
	})
}