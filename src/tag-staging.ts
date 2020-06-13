import {context, GitHub} from '@actions/github'
import * as core from '@actions/core'

export const tagStaging = async (client: GitHub): Promise<void> => {
  console.log('comment detected and is valid, proceeding.')

  const {owner, repo} = context.repo

  const newTag = `staging-${new Date().getTime()}`
  console.log(`tagging ${context.ref} with ${newTag}`)

  const commitsOnPR = await client.pulls.listCommits()
  const lastCommit = commitsOnPR.data[commitsOnPR.data.length - 1].sha

  const commitNewTag = await client.git.createTag({
    ...context.repo,
    tag: newTag,
    message: newTag,
    object: lastCommit,
    type: 'commit'
  })

  return client.git
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
