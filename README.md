<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

# CI Pilot GitHub Actions

A bolt on set of GitHub Actions to perfect your release, deployment and sign off process. Intended to be used alongside [ci-pilot](https://github.com/ultm8soulja/ci-pilot).

## Adding this to your repository

First you need to add create a workflow and and add the job. In `.github/workflows/release.yml` add the following:

```yml
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - uses: jhalvorson/ci-pilot-action@v1.0.0
        with:
          token: "${{ secrets.GITHUB_TOKEN }}"
```

## Action: Stage Release

The stage release action listens for the following comment on any `release/<version>` PRs:

```bash
ci-pilot deploy to staging
```

Every time that comment is left it will tag the branch with `staging-<epoc-timestamp>`. It is then up to your own CI to deploy to your staging environment.

### Configuring CircleCI to deploy on tag changes


### Configuring AWS CodeBuild to deploy on tag changes



## Contributing

Contributions are more than welcome, especially if you're already working in the ci-pilot ecosystem. If you would like to contribute please keep in mind that these actions are designed to be opinionated so you contributions must work with `ci-pilot`'s workflow.

Install the dependencies  
```bash
$ yarn install
```

Build the typescript and package it for distribution
```bash
$ yarn build && yarn pack
```

Run the tests :heavy_check_mark:  
```bash
$ yarn test

 PASS  ./index.test.js
  ✓ throws invalid number (3ms)
  ✓ wait 500 ms (504ms)
  ✓ test runs (95ms)

...
```



See the [toolkit documentation](https://github.com/actions/toolkit/blob/master/README.md#packages) for the various packages.

## Publish to a distribution branch

Actions are run from GitHub repos so we will checkin the packed dist folder. 

Then run [ncc](https://github.com/zeit/ncc) and push the results:
```bash
$ npm run pack
$ git add dist
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

Your action is now published! :rocket: 

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)