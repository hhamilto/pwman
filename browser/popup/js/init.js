/* eslint-disable no-console */
/*
 * FIXME autofill in bg?
 * FIXME cypress tests mebbe
 */

/*
 * FIXME try/catch for http status/network errors?
 * FIXME: refactor for sane code organization
 */
window.addEventListener('DOMContentLoaded', () => {
	const screenEls = document.querySelectorAll('.screen')

	pwman.showScreen = (id) => {
		for (let i = 0; i < screenEls.length; i++) {
			if (screenEls[i].id == id) {
				screenEls[i].classList.remove('hidden')
			} else {
				screenEls[i].classList.add('hidden')
			}
		}
		if (pwman.screens[id].show) {
			pwman.screens[id].show()
		}
	}

	/*
	 * Set up all events
	 */
	pwman.screens.login.setup()
	pwman.screens['main-menu'].setup()
	pwman.screens['add-item'].setup()
	pwman.screens['edit-item'].setup()

	// Startup
	;(async () => {
		const storedCredentials = await browser.storage.local.get(['deviceId', 'secret', 'token', 'tokenExpiration'])
		pwman.credentials.deviceId = storedCredentials.deviceId
		pwman.credentials.secret = storedCredentials.secret
		pwman.credentials.token = storedCredentials.token
		pwman.credentials.tokenExpiration = luxon.DateTime.fromISO(storedCredentials.tokenExpiration)
		if (!pwman.credentials.deviceId) {
			// is not logged in
			await pwman.showScreen('login')
			return
		}
		if (!pwman.credentials.secret) {
			// is not logged in
			await pwman.showScreen('login')
			return
		}
		if (!pwman.credentials.token || !storedCredentials.tokenExpiration || pwman.credentials.tokenExpiration < luxon.DateTime.utc()) {
			// warning mutates global state
			await pwman.helpers.fetchToken({
				deviceId: pwman.credentials.deviceId,
				secret: pwman.credentials.secret
			})
		}

		/*
		 * TODO session tokenExpiration/ renewal
		 * is logged in
		 */
		await pwman.showScreen('main-menu')
	})()
})