# Contributing to Real-Time Chat Platform

Thank you for your interest in contributing! Since this project involves a large team of 27 engineers, strict adherence to these guidelines is crucial for maintaining a healthy and scalable codebase.

## 1. Branch Naming Convention
Always branch off from `develop` (never `main`). Use the following prefixes to clearly state the purpose of the branch:
- **`feature/`** - For new features (e.g., `feature/login-api`, `feature/websocket-auth`)
- **`bugfix/`** - For bug fixes (e.g., `bugfix/chat-scroll`, `bugfix/token-refresh`)
- **`hotfix/`** - For urgent production fixes directly off `main` (e.g., `hotfix/db-connection-drop`)
- **`refactor/`** - For code restructuring without adding behavior
- **`docs/`** - For documentation updates

## 2. Commit Message Convention
We use [Conventional Commits](https://www.conventionalcommits.org/). Every commit message must begin with one of the following prefixes:
- **`feat:`** A new feature
- **`fix:`** A bug fix
- **`docs:`** Documentation only changes
- **`style:`** Changes that do not affect the meaning of the code (white-space, formatting)
- **`refactor:`** A code change that neither fixes a bug nor adds a feature
- **`perf:`** A code change that improves performance
- **`test:`** Adding missing tests or correcting existing tests
- **`chore:`** Changes to the build process or auxiliary tools and libraries

*Example:* `feat: add JWT refresh token endpoint`

## 3. Folder Ownership
To prevent overlapping work and merge conflicts, responsibilities are logically partitioned:
- **Frontend Team**: Owns `frontend/`. 
- **Backend Core**: Owns `backend/config/`, `backend/apps/accounts/`, and `backend/apps/common/`.
- **Backend Features**: Owns `backend/apps/chat/`, `backend/apps/conversations/`, and `backend/apps/notifications/`.
- **DevOps**: Owns `docker/`, `docker-compose.yml`, and CI/CD pipelines.

## 4. How to Sync with Develop
To keep your feature branch up-to-date and prevent massive merge conflicts later:
```bash
# 1. Fetch the latest changes from the remote repository
git fetch origin

# 2. Checkout your feature branch (if not already on it)
git checkout feature/your-feature-name

# 3. Rebase your branch onto develop
git rebase origin/develop
```
*Note: We prefer rebasing over merging to keep a linear and clean git history.*

## 5. How to Resolve Merge Conflicts
If you encounter conflicts during a rebase or pull:
1. Git will pause the rebase/merge and tell you which files have conflicts.
2. Open the conflicting files in your IDE (VS Code/JetBrains). Look for the `<<<<<<< HEAD` markers.
3. Manually resolve the conflict by choosing the correct code block.
4. Stage the resolved files:
   ```bash
   git add <resolved-file>
   ```
5. Continue the rebase (or complete the merge):
   ```bash
   git rebase --continue
   ```
6. **NEVER force push (`--force`) to `develop` or `main`.** You may only force push to your own feature branch after a rebase.

## 6. Code Review Rules
- **Two Approvals Required**: Every PR must have at least 2 approving reviews from team members before it can be merged.
- **Automated Checks**: All GitHub Actions (linting, testing) must pass.
- **Reviewer Responsibilities**: Check for business logic errors, verify tests, ensure the code matches our architectural patterns, and confirm code is properly formatted (Black/isort/Prettier).

## 7. Pull Request Checklist
Before requesting a review, ensure you have:
- [ ] Rebased onto the latest `origin/develop`.
- [ ] Followed the branch naming and commit conventions.
- [ ] Run formatters (`npm run format`, `black .`, `isort .`).
- [ ] Checked for console logs, debug statements, or commented-out code.
- [ ] Added or updated tests as necessary.
- [ ] Completed the PR Template description on GitHub.
