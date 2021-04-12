pwman.screens.login = {}
pwman.screens.login.setup = () => {
	document.querySelector('#login form').addEventListener('submit', async (e) => {
		e.preventDefault()
		const showError = (message) => {
			const errorMessageEl = document.querySelector('#login .error')
			errorMessageEl.classList.remove('hidden')
			errorMessageEl.textContent = message
		}
		const username = document.querySelector('#login .username').value
		const password = document.querySelector('#login .password').value
		if (!pwman.credentials.deviceId || !pwman.credentials.secret) {
			let createDeviceResp
			try {
				createDeviceResp = await pwman.helpers.createDevice({
					username,
					password
				})
			} catch (e) {
				// TODO better message
				showError('Could not create a device: ' + e.message)
				return
			}
			if (createDeviceResp.error) {
				showError('Could not login: ' + createDeviceResp.error)
				return
			}

			await browser.storage.local.set({
				deviceId: createDeviceResp.deviceId,
				secret: createDeviceResp.deviceSecret
			})
			// eslint-disable-next-line require-atomic-updates
			pwman.credentials.deviceId = createDeviceResp.deviceId
			// eslint-disable-next-line require-atomic-updates
			pwman.credentials.secret = createDeviceResp.deviceSecret
		}
		// Warning mutates global state
		try {
			await pwman.helpers.fetchToken({
				deviceId: pwman.credentials.deviceId,
				secret: pwman.credentials.secret
			})
		} catch (e) {
			// TODO better message
			showError('Could not login: ' + e.message)
			return
		}
		await pwman.showScreen('main-menu')
	})
}