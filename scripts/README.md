# BRF-SaaS Scripts

This directory contains utility scripts for managing the BRF-SaaS project.

## Issue Creation Script

The `create-issues.js` script automatically creates GitHub issues from the `ISSUES.md` file in the root directory.

### Setup

1. Install dependencies:
```bash
cd scripts
npm install
```

2. Create a GitHub Personal Access Token:
   - Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token
   - Select scopes:
     - `repo` (full)
     - `project` (full)
   - Copy the token

3. Set the token as an environment variable:
```bash
export GITHUB_TOKEN='your-token-here'
```

### Usage

Run the script:
```bash
npm run create-issues
```

The script will:
1. Read the `ISSUES.md` file
2. Parse all issues
3. Create them in GitHub with proper:
   - Title
   - Description
   - Labels
   - Milestone
   - Assignee

### Format

Issues in `ISSUES.md` should follow this format:

```markdown
title: Issue Title
labels: label1, label2
milestone: Milestone Name
assignee: username

**Objective**
Description of the issue

**Requirements**
- Requirement 1
- Requirement 2

**Acceptance Criteria**
- [ ] Criteria 1
- [ ] Criteria 2
``` 