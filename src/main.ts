/* eslint-disable no-console */
import * as core from '@actions/core'
import github, {context} from '@actions/github'

const STAGING_DEPLOY_COMMENT = 'ci-pilot deploy to staging'

async function run(): Promise<void> {
  try {
    // Setup
    const token = core.getInput('token', {required: true})
    const client = new github.GitHub(token)

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
        ? context.payload.comment.body
        : false

    if (comment && comment !== STAGING_DEPLOY_COMMENT) {
      core.setFailed(`comment did not match "${STAGING_DEPLOY_COMMENT}"`)
      return
    }

    if (comment) {
      console.log('comment detected and is valid, proceeding.')
      const {GITHUB_SHA} = process.env

      if (!GITHUB_SHA) {
        core.setFailed('GITHUB_SHA not found')
        return
      }

      const {owner, repo} = context.repo

      const newTag = `staging-${new Date().getTime()}`
      console.log(`tagging ${context.ref} with ${newTag}`)

      const commitNewTag = await client.git.createTag({
        ...context.repo,
        tag: newTag,
        message: newTag,
        object: GITHUB_SHA,
        type: 'commit'
      })

      await client.git
        .createRef({
          ...context.repo,
          ref: `refs/tags/${newTag}`,
          sha: commitNewTag.data.sha
        })
        .then(async () => {
          // React to the comment to acknowledge that we've tagged the branch
          await client.reactions.createForIssueComment({
            owner,
            repo,
            // eslint-disable-next-line @typescript-eslint/camelcase
            comment_id: context.payload.comment.id,
            content: '+1'
          })
        })
        .catch(() => {
          core.setFailed('failed to commit new tag')
        })
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
