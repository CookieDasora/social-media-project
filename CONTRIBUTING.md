# Contributing

## Quick links
* [Code of Conduct](#code-of-conduct)
* [Issues / Bugs / Features](#issues--bugs--features)
* [Submission Guidelines](#submit)
* [Development Setup](#development-setup)
* [Coding Rules](#coding-rules)
* [Commit Message Guidelines](#commit-message-guidelines)

## Code of Conduct
By participating and contributing to this project,
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
Before submitting an issue, please check the issue tracker to see if a similar issue has already been reported.
Existing discussions might provide insights or updates, such as whether the issue is already being addressed or if a 
workaround exists.

If you're reporting a bug, it’s essential that I can reproduce and confirm the issue before working on a fix.
To help with this, please provide a minimal reproduction scenario using a separate repository or code example.

Unfortunately, I won’t be able to investigate or fix bugs without this reproduction. 

If I don’t receive the necessary details to reproduce the problem within a reasonable timeframe, I may close the issue.

To submit a new issue, please fill out the [new issue form](https://github.com/hknsh/project-knedita/issues/new) with
as much detail as possible, including: 
- Steps to reproduce the problem.
- Expected behavior versus actual behavior.
- Environment details (e.g., OS, Bun version, dependencies).

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
    git commit -m [commit message]
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
To maintain a high standard of code quality and consistency, all contributors must adhere to the following rules:

#### General Structure
- Follow the standard **NestJS** module structure (e.g., `controllers`, `services`, `dto`, etc.).
- Ensure files adhere to the **Single Responsibility Principle**. Aim to keep files under **300** lines for maintainability.
- Use **DTOs** to define request and response structure for all API endpoints.
- Group files by feature or module, e.g., keep controllers, services, and DTOs of a feature/module in the same directory.

#### Types and Contracts
- Use **interfaces** for defining object contracts and **types** for unions or complex mappings.
- Avoid using `any`. Prefer `unknown` or `never` when applicable to ensure stricter type safety.

#### Database and Migrations
- Always make schema updates in `prisma/scheme.prisma`. Avoid editing autogenerated files like `/src/db/types.ts`.
- After updating the schema, run the necessary migrations and ensure they are named clearly and concisely
(e.g., `add_user_email_column`). Avoid generic names like `migration1`.

#### Sensitive Data
- Manage sensitive configurations and secrets with a `.env` file. Ensure this file is excluded from version control
(e.g., via `.gitignore`).

#### Endpoints and Pagination
- Implement **pagination** for endpoints that return large datasets to improve performance and usability.
- Document all API endpoints thoroughly, including their purpose, parameters, and all possible response codes and their
meanings.

#### Code Style
- Use PascalCase for classes and interfaces.
- Use camelCase for variables, methods, and functions.
- Prefer `async/await` for handling asynchronous operations over raw promises.
- Code style will be enforced using BiomeJS and the `.editorconfig` file. Ensure your code passes all linting rules before
submitting a PR.

#### File Naming and Structure
- Every file must follow this naming convention: `name.type.ts` (e.g., `user.controller.ts`).
- Organize code logically within the corresponding module and directory structure.

#### Best Practices
- **Don't Repeat Yourself (DRY)**:
  - Extract reusable logic into helper methods, services, or modules.
  - Leverage **pipes** and **interceptors** to centralize and simplify validations and transformations.
- **Keep It Simple, Stupid (KISS)**:
  - Always prefer simpler, maintainable solutions over complex ones, even if they require a bit more effort initially.
- Write **meaningful comments** for any complex or non-intuitive logic. Comments should explain *why* something is done,
not just *what* it does.

## Commit Message Guidelines
You **must** follow the **Conventional Commits** format for all commit messages:

```bash
<type>[optional scope]: <description>
<BLANK LINE>
[optional body]
<BLANK LINE>
[optional footer(s)]
```

#### Format rules
- `type` (required): Describes the type of change being made (e.g., `feat`, `fix`, `docs`).
- `description` (required): A concise summary of what the commit does. Use the imperative mood
(e.g., "add user validation").
  - Don't capitalize first letter.
  - No dot (.) at the end.
- `scope`: Specifies the area of the codebase being changed. Use it when the change is related to a specific
feature or module (e.g., `user`, `kweek`).  
- `body`: Provides additional context or details about the change. Use when the `description` alone is not sufficient
to explain the change.
  - Limit lines to 72 characters.
  - Describe **what** was done and **why**. Avoid implementation details.
- `footer`: Use for metadata such as breaking changes or referencing related issues.
  - For breaking changes, start with `BREAKING CHANGE:` followed by an explanation of the change, its impact, and how to
  migrate.
  - To reference issues or pull requests, use `Fixes #<issue-number>` or `Closes #<issue-number>`.

#### Types
- `feat`: A new feature.
- `fix`: A bug fix.
- `docs`: Documentation changes only.
- `style`: Changes that do not affect code functionality (e.g., linting).
- `refactor`: Refactoring code without adding or fixing functionality.
- `test`: Adding or updating tests.
- `chore`: Maintenance tasks like updating dependencies.

#### Scopes

Scopes help clarify which part of the codebase is affected by the change.

A scope typically refers to the **controller**, **service**, **module**, etc., being modified.

Use one of the following supported scopes:

- `app`: For changes in core application files, such as `app.module.ts` and `main.ts`.
- `config`: For changes in configuration-related files, like `configuration.ts` or `environment.ts`.
- `auth`: For changes in the `auth` module, including guards (e.g., `jwt-auth.guard.ts`), strategies 
(e.g., `jwt.strategy.ts`), controllers, services, or DTOs.
- `kweeks`: For changes in the `kweeks` module, covering controllers (e.g., `kweeks.controller.ts`), services,
repositories, schemas, or DTOs.
- `users`: For changes in the `users` module, including controllers (e.g., `users.controller.ts`), services, repositories,
schemas, DTOs, or utility types.
- `service`: For changes in shared services such as `kysely` or `s3`, including their modules and related files.
- `db`: For changes in database-related files, including Prisma schemas, database type definitions, or query builders.

When none of the above scopes fit, choose the one most closely aligned with the affected functionality.

If the change impacts multiple areas, consider splitting it into smaller commits.

#### Examples

1. Simple commit
    ```text
    feat(users): add e-mail verification when creating a new user 
    ```
2. Commit with body
    ```text
    fix(kweeks): handle pagination errors when fetching kweeks
   
    Fixed an issue where the pagination parameters were ignored, causing all 
    records to be fetched at once. This improves performance and prevents
    overloading the client with large datasets.
    ```
3. Commit with body and footer
    ```text
    refactor(users): improve performance of user update endpoint
   
    Refactored the update logic to reduce database queries by using batch  
    updates. Added proper logging to track update failures more effectively.

    BREAKING CHANGE: Update endpoint now requires a batch request format.  
    Details on the new format are available in the API documentation.

    Fixes #42   
    ```
