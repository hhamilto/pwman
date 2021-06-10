pwman.screens['generate-password'] = {}

// TODO: Move these consts to the background so we don't re-run on every popup
const CAPITAL_LETTERS = []
let letter
for (letter = 'A'; letter <= 'Z'; letter = String.fromCharCode(letter.charCodeAt(0) + 1)) {
	CAPITAL_LETTERS.push(letter)
}

const LOWERCASE_LETTERS = []
for (letter = 'a'; letter <= 'z'; letter = String.fromCharCode(letter.charCodeAt(0) + 1)) {
	LOWERCASE_LETTERS.push(letter)
}

const NUMBERS = '1234567890'.split('')

const SYMBOLS = '!@#$%^&*()_+{}:"<>?~`'.split('')

/*
 * TODO:
 * Remember length
 * add dissallowed char list
 * add checkboxes for upperlower and symbols on/off
 */
pwman.screens['generate-password'].setup = () => {
	document.querySelector('#generate-password form').addEventListener('submit', async (e) => {
		e.preventDefault()
		const symbolBank = []
		symbolBank.push(...CAPITAL_LETTERS)
		symbolBank.push(...LOWERCASE_LETTERS)
		symbolBank.push(...NUMBERS)
		symbolBank.push(...SYMBOLS)
		const length = parseInt(document.querySelector('#generate-password .length').value)
		if (isNaN(length)) {
			// TODO: error handling
			// eslint-disable-next-line
			alert("nope!")
		}
		let password = ''
		const MAX_UINT32_VAL = 4294967295
		const randomUInt32Array = new Uint32Array(length)
		window.crypto.getRandomValues(randomUInt32Array)
		for (let i = 0; i < length; i++) {
			const randomUInt32 = randomUInt32Array[i]
			password += symbolBank[Math.floor(randomUInt32 / MAX_UINT32_VAL * symbolBank.length)]
		}
		const passwordEl = document.querySelector('#generate-password .generated-password')
		passwordEl.value = password
		await navigator.clipboard.writeText(password)
	})
	document.querySelector('#add-item form .back').addEventListener('click', async (e) => {
		e.preventDefault()
		await pwman.showScreen('main-menu')
	})
}