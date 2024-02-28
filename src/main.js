const github = require('@actions/github')
const core = require('@actions/core')
const { exec } = require('@actions/exec')

const editJsonFile = require('edit-json-file')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const ref = github.context.ref
    if (!ref.includes('release')) {
      core.info('Not on release branch, skipping version bump.')
      return
    }
    const branchName = ref.replace('refs/heads/', '')
    const version = branchName.match(/release\/(\d+\.\d+\.\d+)/)?.[1]

    if (!version) {
      core.setFailed('Could not determine version from branch name')
      return
    }

    const packageFile = editJsonFile('./package.json')
    const packageVersion = packageFile.get('version')

    if (packageVersion === version) {
      core.info('Version already set, skipping bump.')
      return
    }

    core.info(`Current version to set: ${version}`)
    packageFile.set('version', version)
    packageFile.save()

    await exec(`git pull origin ${branchName}`)
    await exec('git add package.json')
    await exec(
      `git commit -m "Automatically bump version from ${packageVersion} to ${version}"`
    )
    await exec(`git push origin ${branchName}`)
  } catch (error) {
    console.error(error)
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
