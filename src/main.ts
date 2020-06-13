import * as core from '@actions/core'
import github, {context} from '@actions/github'

const STAGING_DEPLOY_COMMENT = 'ci-pilot deploy to staging'

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', {required: true})

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
    if (!isDevMode && !currentBranch.includes('release/')) {
      core.setFailed(
        `A deployment to staging was triggered from ${context.ref}. Staging deployments may only be triggered from release branches.`
      )
    }

    const comment =
      context.eventName === 'issue_comment'
        ? context.payload.comment.body
        : false

    if (comment === STAGING_DEPLOY_COMMENT && context.payload.comment.id) {
      const client = new github.GitHub(token)
      const {owner, repo} = context.repo

      const newTag = `staging-${new Date().getTime()}`
      core.debug(`tagging ${context.ref} with ${newTag}`)

      // React to the comment to acknowledge that we've tagged the branch
      await client.reactions.createForIssueComment({
        owner,
        repo,
        // eslint-disable-next-line @typescript-eslint/camelcase
        comment_id: context.payload.comment.id,
        content: '+1'
      })
    }
  } catch (error) {
    // The action has failed, use built in error handling
    core.setFailed(error.message)
  }
}

run().catch(err => {
  // eslint-disable-next-line no-console
  console.error(err)
  core.setFailed('An unexpected error occured during run')
})
