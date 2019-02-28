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

async function handlerFunction(selection) {
  if (!selection.items.length) {
    return
  }
  const renditionSettings = []
  const folder = await fs.getFolder()

  await Promise.all(selection.items.map(async (item) => {
  	try {
  		const file = await folder.createFile(`${sanitizeName(item.name)}.png`, {overwrite: true})
	  	renditionSettings.push({
		    node: item,
		    outputFile: file,
		    type: application.RenditionType.PNG,
		    scale: 3,
			})
  	} catch (e) {
  		console.log(e)
  	}
  }))

	application.createRenditions(renditionSettings)
    .then(results => {
      console.log('All are done')
    })
    .catch(error => {
      console.log(error)
    })
}

module.exports = {
  commands: {
    "exportAtX": handlerFunction,
  },
}
