import * as core from '@actions/core'
import {context, GitHub} from '@actions/github'
import {tagStaging} from './tag-staging'
import {listCommands} from './list-commands'

const STAGING_DEPLOY_COMMENT = 'ci-pilot deploy to staging'
const HELP_COMMENT = 'ci-pilot help'

async function run(): Promise<void> {
  try {
    // Setup
    const token = core.getInput('token', {required: true})
    const client = new GitHub(token)

    if (!token) {
      core.setFailed('GITHUB_TOKEN is required.')
      return
    }

    // You can use the isDevMode flag to skip certain checks such as branch
    // name validation
    const isDevMode: boolean = core.getInput('dev_mode') === 'true'

    // Ensure that we're on the release branch, if we're not on the release
    // branch then immediately fail the job and provide some basic feedback
    const currentBranch = context.ref
    console.log('checking branch name')
    if (!isDevMode && !currentBranch.includes('release/')) {
      core.setFailed(
        `A deployment to staging was triggered from ${context.ref}. Staging deployments may only be triggered from release branches.`
      )
    }

    console.log('checking for comment')
    const comment =
      context.eventName === 'issue_comment'
        ? context.payload.comment.comment
        : false

    console.log({comment, body: context.payload.comment})

    if (comment === STAGING_DEPLOY_COMMENT) {
      tagStaging(client)
    }

    if (comment === HELP_COMMENT) {
      listCommands(client)
    }
  } catch (error) {
    // The action has failed, use built in error handling
    core.setFailed(error.message)
  }
}

run().catch(err => {
  console.error(err)
  core.setFailed('An unexpected error occured during run')
})
