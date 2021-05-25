(() => {
	pwman.screens['main-menu'] = {}
	pwman.screens['main-menu'].setup = () => {
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


	const fillItemOnBrowserPage = async (item) => {
		const [currentTab] = await browser.tabs.query({
			currentWindow: true,
			active: true
		})
		await browser.tabs.sendMessage(
			currentTab.id,
			{
				action: "fill item",
				item
			}
		)
	}

	const renderItems = (items) => {
		const currentItemsULEL = document.querySelector('#main-menu .current-items')
		currentItemsULEL.innerHTML = ''
		var itemTemplate = document.querySelector('#item-row')
		items.forEach(i => {
			const liEl = itemTemplate.content.cloneNode(true)
			liEl.querySelector(".website").textContent = i.item.website.join(', ')
			liEl.querySelector(".username").textContent = i.item.username
			liEl.querySelector("button.fill").addEventListener('click', (e) => {
				e.preventDefault()
				fillItemOnBrowserPage(i.item)
			})
			// TODO -- seems like this logic should live in the edit screen
			liEl.querySelector("button.edit").addEventListener('click', async (e) => {
				e.preventDefault()
				await pwman.showScreen('edit-item')
				document.querySelector('#edit-item .website').value = i.item.website.join(', ')
				document.querySelector('#edit-item .username').value = i.item.username
				document.querySelector('#edit-item .password').value = i.item.password
				document.querySelector('#edit-item .item-id').value = i.id
			})
			currentItemsULEL.appendChild(liEl)
		})
	}

	pwman.screens['main-menu'].show = async () => {
		let items
		try {
			items = await pwman.helpers.fetchItems()
		} catch (e) {
			pwman.log("Could not fetch items: ", e)
		}
		if (items) {
			renderItems(items)
		}
	}
})()