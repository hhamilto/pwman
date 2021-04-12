pwman.screens['add-item'] = {}
pwman.screens['add-item'].setup = () => {
	document.querySelector('#add-item form').addEventListener('submit', async (e) => {
		e.preventDefault()
		const username = document.querySelector('#add-item .username').value
		const password = document.querySelector('#add-item .password').value
		const website = document.querySelector('#add-item .website').value
		await fetch(SERVER_BASE_URI + '/items', {
			method: "POST",
			body: JSON.stringify({
				item: {
					username,
					password,
					website,
				},
				deviceId: pwman.credentials.deviceId,
				token: pwman.credentials.token
			}),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
				Authorization: "Bearer " + pwman.credentials.token
			}
		})
		await pwman.showScreen('main-menu')
	})
	document.querySelector('#add-item form .back').addEventListener('click', async (e) => {
		e.preventDefault()
		await pwman.showScreen('main-menu')
	})
}

pwman.screens['edit-item'] = {}
pwman.screens['edit-item'].setup = () => {
	document.querySelector('#edit-item form').addEventListener('submit', async (e) => {
		e.preventDefault()
		const username = document.querySelector('#edit-item .username').value
		const password = document.querySelector('#edit-item .password').value
		const website = document.querySelector('#edit-item .website').value
		const itemId = document.querySelector('#edit-item .item-id').value
		await fetch(SERVER_BASE_URI + '/items/' + itemId, {
			method: "PUT",
			body: JSON.stringify({
				item: {
					username,
					password,
					website,
				}
			}),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
				Authorization: "Bearer " + pwman.credentials.token
			}
		})
		await pwman.showScreen('main-menu')
	})
	document.querySelector('#edit-item form .back').addEventListener('click', async (e) => {
		e.preventDefault()
		await pwman.showScreen('main-menu')
	})
}