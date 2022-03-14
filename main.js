const application = require("application")
const fs = require("uxp").storage.localFileSystem

const removeTheNotApproved = (unsanitized) => {
	return unsanitized.replace(/[\\:*?"<>|#]/g, '')
}

const dashesForSlashes = (unsanitized) => {
	return unsanitized.replace(/\//g, '-')
}

/**
 * Removes characters which are not allowed in file names and inserts dashes (-) for slashes.
 *
 * Removed: \:*?"<>|#
 * Dashed: /
 */
const sanitizeName = (unsanitized) => {
	return removeTheNotApproved(dashesForSlashes(unsanitized))
}

async function exportAt(selection, scale, format) {
	const renditionSettings = []
	const folder = await fs.getFolder()
	const ext = format.toLowerCase()

	await Promise.all(selection.items.map(async (item) => {
		try {
			const base = sanitizeName(item.name)
			const fileName = scale === 1
				? `${base}.${ext}`
				: `${base}@${scale}x.${ext}`
			const file = await folder.createFile(fileName, { overwrite: true })
			renditionSettings.push({
				node: item,
				outputFile: file,
				type: application.RenditionType[format],
				scale: scale,
				// quality only matters for JPG
				quality: format === 'JPG'
					? 100
					: undefined,
			})
		} catch (e) {
			console.log(e)
		}
	}))

	application.createRenditions(renditionSettings)
		// .then((results) => {})
		.catch((error) => {
			console.log(error)
		})
}

function exportDialog() {
	/**
	 * Height and width need to be set up front. Can't them change later
	 *
	 * On Windows the size of dialog is constrained by the size of the window
	 */
	const dialog = document.createElement("dialog")

	const selectId = 'select'
	dialog.innerHTML = `
		<style type="text/css">
			.formatChoice {
				display: flex;
				justify-content: flex-start;
				align-items: center;
			}
		</style>
		<form method="dialog">
			<div class="formatChoice"><span>Exporting as:</span>
				<select
					id="${selectId}"
				>
					<!-- set to PNG by default by adding "selected" attribute -->
					<option
						value="PNG"
						selected
					>PNG</option>
					<option
						value="JPG"
					>JPG</option>
				</select>
			</div>

			<div>Which scale do you want to export at?</div>
			<footer>
				<button
					id="cancel"
					type="reset"
					uxp-variant="secondary"
					uxp-quiet="true"
				>Cancel</button>

				<button
					id="btn1x"
					type="button"
					uxp-variant="primary"
				>1x</button>

				<button
					id="btn2x"
					type="button"
					uxp-variant="primary"
				>2x</button>

				<button
					id="btn3x"
					type="button"
					uxp-variant="primary"
					autofocus="autofocus"
				>3x</button>
			</footer>
		</form>
	`

	let response = {
		scale: undefined,
		format: undefined,
		cancelled: false,
	}
	// set to PNG by default
	response.format = 'PNG'

	const closeOptions = {
		'#cancel': { cancelled: true },
		'#btn1x': {
			scale: 1,
			cancelled: false,
		},
		'#btn2x': {
			scale: 2,
			cancelled: false,
		},
		'#btn3x': {
			scale: 3,
			cancelled: false,
		},
	}

	// Listening to the 'close' event is the only way I can set the dialog
	// response when ENTER is pressed (otherwise it's just an empty string)
	dialog.addEventListener('close', (evt) => {
		dialog.close(response)
	})

	Object.keys(closeOptions).forEach((key) => {
		// Clicking on a button will prepare the correct response value and then
		// directly close the dialog
		dialog.querySelector(key).addEventListener('click', () => {
			Object.assign(response, closeOptions[key])
			dialog.close()
		})

		// Focusing on a button (like when TABbing through the buttons) will prepare
		// the correct response value when closing the dialog
		dialog.querySelector(key).addEventListener('focus', (evt) => {
			Object.assign(response, closeOptions[key])
		})
	})

	// The only downside to the current approach is that the ESC key doesn't work
	// as expected. This event listener fixes that.
	dialog.addEventListener('keydown', (evt) => {
		// capture if ESC key is pressed and set the appropriate response value
		if (evt.keyCode === 27) {
			response.cancelled = true
		}
	})

	const selectEl = dialog.querySelector(selectId)

	// <select value="…"/> does not show the value as selected. Instead, get a reference to
	// the element and call setAttribute("value", …) or use the selected attribute on the
	// option tags.
	// - https://adobexdplatform.com/plugin-docs/known-issues.html
	selectEl.addEventListener('change', (evt) => {
		selectEl.setAttribute('value', evt.target.value)
		Object.assign(response, { format: evt.target.value })
	})

	document.appendChild(dialog)

	return dialog
}

function noSelectionDialog() {
	const dialog = document.createElement("dialog")

	dialog.innerHTML = `
		<form method="dialog">
			<h2>⚠️ Not so fast</h2>
			<p>Don't forget to select something to export :)</p>

			<footer>
				<button
					id="ok"
					type="submit"
					uxp-variant="cta"
				>OK, I will select something</button>
			</footer>
		</form>
	`
	document.appendChild(dialog)

	return dialog
}

async function showDialog(selection) {
	if (!selection.items.length) {
		const dialog = noSelectionDialog()
		await dialog.showModal()
		dialog.remove()
		return
	}

	const dialog = exportDialog()

	// `showModal` returns a Promise, that's why we await. If you're waiting for
	// dialog responses you need to make an async function so XD knows not to
	// close the document.
	const response = await dialog.showModal()

	if (
		!response.cancelled &&
		typeof response.scale === 'number' &&
		typeof response.format === 'string'
	) {
		exportAt(selection, response.scale, response.format)
	}

	// If the dialog is not explicitly removed it will stay in RAM but won't be
	// visible to the user.
	dialog.remove()
}

module.exports = {
	commands: {
		"exportAtX": showDialog,
	},
}
