import {GitHub, context} from '@actions/github'
import * as core from '@actions/core'

export const listCommands = async (client: GitHub): Promise<void> => {
  try {
    console.log('running help command')
    const body =
      '### :wave: here are some helpful commands\n\n\n`ci-pilot deploy to staging`\nThis will tag your current branch with a staging command, allowing your CI to deploy to a staging environment.'

    if (context.payload.pull_request?.number) {
      await client.issues.createComment({
        ...context.repo,
        body,
        // eslint-disable-next-line @typescript-eslint/camelcase
        issue_number: context.payload.pull_request.number
      })
    }
  } catch (err) {
    core.setFailed(err)
  }
}
