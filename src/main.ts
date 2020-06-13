import * as core from '@actions/core'
import {context} from '@actions/github'

async function run(): Promise<void> {
  try {
    // Ensure that we're on the release branch, if we're not on the release
    // branch then immediately kill the job and provide some basic feedback
    const currentBranch = context.ref
    if (!currentBranch.includes('release/')) {
      core.setFailed(
        `A deployment to staging was triggered from ${context.ref}. Staging deployments may only be triggered from release branches.`
      )
    }
  } catch (error) {
    // The action has failed, use built in error handling
    core.setFailed(error.message)
  }
}

run()
