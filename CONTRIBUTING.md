# Contributing

## Quick links
* [Code of Conduct](#code-of-conduct)
* [Issues / Bugs / Features](#issues--bugs--features)
* [Submission Guidelines](#submit)
* [Development Setup](#development-setup)
* [Coding Rules](#coding-rules)
* [Commit Message Guidelines](#commit-message-guidelines)

## Code of Conduct
We take our open source community seriously and hold ourselves and other contributors
to high standards of communication. By participating and contributing to this project,
you agree to uphold our [Code of Conduct](https://github.com/hknsh/project-knedita/blob/improvements/CODE_OF_CONDUCT.md).

## Issues / Bugs / Features
**Please do not open issues for general support questions**. If you have any questions, feel free to
contact me via e-mail at me@hknsh.com or through any of my available [social media channels](https://social.hknsh.com).

If you encounter a bug in the source code, please help by [submitting an issue](#submit-issue)
to the [project repository](https://github.com/hknsh/project-knedita). You may also [submit a Pull Request](#submit-pr)
with a fix.

If you'd like to request a new feature, please [submit an issue](#submit-issue) to the project repository.
If you want to *implement* the feature, please first submit an issue outlining your proposal. This helps ensure that
the feature is aligned with the project's direction and avoids duplicated work.

Consider the scope of the change:
- For **Major Features**, open an issue to discuss your proposal. This allows us to coordinate, refine the idea,
and ensure the change is successfully integrated into the project. Please prefix the issue with `[discussion]`, e.g.,
`[discussion]: your idea`.
- **Smaller Features** can be implemented and directly [submitted as a Pull Request](#submit-pr) 

## <a name="submit"></a> Submission Guidelines

### <a name="submit-issue"></a> Submitting an Issue
TODO

### <a name="submit-pr"></a> Submitting a Pull Request (PR)
Before you submit your Pull Request (PR), please follow these steps:

1. Search [GitHub Pull Requests](https://github.com/hknsh/project-knedita/pulls) for an open or closed PR that relates
to your submission.
2. Fork this repository.
3. Make your changes in a new branch, based on the latest `master` branch.
    ```bash
    git checkout -b my-branch master
    ```
4. Implement the fix or feature you'd like to contribute.
5. Ensure your code adheres to the [Coding Rules](#coding-rules)
6. Commit your changes using a descriptive commit message that follows the [commit message conventions](#commit-message-guidelines)
    ```bash
    git commit [commit message]
    ```
7. Push your branch to GitHub.
    ```bash
   git push origin my-branch
    ```
8. In GitHub, open a pull request targeting the `project-knedita:master` branch
   - If changes are suggested:
     - Make the necessary updates.
     - Rebase your branch and force push the changes
       ```bash
        git rebase master -i
        git push -f
       ```
That's it! Thanks for contributing to the project!

#### After your pull request is merged
After your pull request is merged, you can clean up your branch: 

- Delete the remote branch on GitHub either through GitHub website or your local shell as follows:
    ```bash
  git push origin --delete my-branch
    ```
- Check out the master branch
    ```bash
  git checkout master -f
    ```
- Delete the local branch
    ```bash
  git branch -D my-branch
    ```
- Update your master with the latest upstream version
    ```bash
  git pull --ff upstream master
    ```

## Development Setup
To set up your development environment, please follow the instructions in the
project's [README](https://github.com/hknsh/project-knedita/blob/improvements/README.md). It contains all the necessary
steps to get started, including installing dependencies, configuration details and running the api.

## Coding Rules
TODO

## Commit Message Guidelines
TODO
