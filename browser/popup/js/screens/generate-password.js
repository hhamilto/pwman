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
const credentials = await browser.storage.local.get(['deviceId', 'secret', 'token', 'tokenExpiration'])
	const deviceId = credentials.deviceId
	const secret = credentials.secret
	let tokenExpiration = luxon.DateTime.fromISO(credentials.tokenExpiration)
	if (!deviceId || !secret) {
		return
	}
	if (tokenExpiration > luxon.DateTime.utc().plus({minutes:1})) {
		return
	}
	const tokenInfo = await fetchToken({
		deviceId,
		secret
	})
	tokenExpiration = tokenInfo.tokenExpiration
	await browser.storage.local.set({
		token: tokenInfo.token,
		tokenExpiration: tokenInfo.tokenExpiration,
	})
	*/


const lengthInputEl = document.querySelector('#generate-password form .length')
const uppercaseInputEl = document.querySelector('#generate-password form .uppercase')
const lowercaseInputEl = document.querySelector('#generate-password form .lowercase')
const symbolsInputEl = document.querySelector('#generate-password form .symbols')
const numbersInputEl = document.querySelector('#generate-password form .numbers')
/*
 * TODO:
 * Remember length
 * add dissallowed char list
 * add checkboxes for upperlower and symbols on/off
 */
pwman.screens['generate-password'].setup = () => {
	lengthInputEl.addEventListener('input', async (e) => {
		const currentValue = lengthInputEl.value
		const stripped = currentValue.replace(/[^0-9]/g,'')
		lengthInputEl.value = stripped
	})
	document.querySelector('#generate-password form').addEventListener('change', async (e) => {
		await browser.storage.local.set({
			passwordGenerationOptions:{
				length: lengthInputEl.value,
				includeUppercase: uppercaseInputEl.checked,
				includeLowercase: lowercaseInputEl.checked,
				includeNumbers: numbersInputEl.checked,
				includeSymbols: symbolsInputEl.checked,
			}
		})
	});
	document.querySelector('#generate-password form').addEventListener('submit', async (e) => {
		e.preventDefault()
		const symbolBank = []
		if (uppercaseInputEl.checked) {
			symbolBank.push(...CAPITAL_LETTERS)
		}
		if (lowercaseInputEl.checked) {
			symbolBank.push(...LOWERCASE_LETTERS)
		}
		if (numbersInputEl.checked) {
			symbolBank.push(...NUMBERS)
		}
		if (symbolsInputEl.checked) {
			symbolBank.push(...SYMBOLS)
		}
		const length = parseInt(lengthInputEl.value)
		if (isNaN(length)) {
			// TODO: error handling
			// eslint-disable-next-line
			alert("unable to parse valid length!")
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
	document.querySelector('#generate-password form .back').addEventListener('click', async (e) => {
		e.preventDefault()
		await pwman.showScreen('main-menu')
	})
}

pwman.screens['generate-password'].show = async () => {
	const { passwordGenerationOptions } = await browser.storage.local.get('passwordGenerationOptions') || {}
	lengthInputEl.value = passwordGenerationOptions.length || 10;
	uppercaseInputEl.checked = passwordGenerationOptions.includeUppercase
	lowercaseInputEl.checked = passwordGenerationOptions.includeLowercase
	numbersInputEl.checked = passwordGenerationOptions.includeNumbers
	symbolsInputEl.checked = passwordGenerationOptions.includeSymbols
}