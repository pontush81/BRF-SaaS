# Using GitHub Projects for BRF-SaaS Development

This guide explains how to set up and use GitHub Projects to manage the development of BRF-SaaS.

## Setting Up GitHub Projects

1. Navigate to your repository: https://github.com/pontush81/BRF-SaaS
2. Click on the "Projects" tab
3. Click "New project"
4. Select "Board" as the template
5. Name the project "BRF-SaaS Development"

## Project Structure

Configure the project with the following columns:

- **Backlog**: Tasks that are planned but not yet ready to be worked on
- **Todo**: Tasks that are ready to be worked on in the current phase
- **In Progress**: Tasks currently being worked on
- **Review**: Tasks ready for review or testing
- **Done**: Completed tasks

## Creating Issues for Tasks

For each task in your roadmap, create a GitHub issue:

1. Go to the "Issues" tab in your repository
2. Click "New issue"
3. Add a descriptive title and detailed description
4. Add appropriate labels:
   - `phase:1`, `phase:2`, etc. for the project phase
   - `type:feature`, `type:bug`, `type:infrastructure`, etc. for the type of work
   - `priority:high`, `priority:medium`, `priority:low` for priority
5. Assign the issue to the relevant team member (or yourself)
6. Add the issue to your project

## Example Issue Structure

Here's an example of how to structure an issue:

**Title**: Implement Multi-Tenant Database Schema

**Description**:
```
## Objective
Create the database schema modifications needed for multi-tenancy.

## Requirements
- Create new 'organizations' table
- Add 'organization_id' column to all existing tables
- Create appropriate indexes for performance
- Design Row Level Security policies

## Acceptance Criteria
- [ ] All tables have organization_id column
- [ ] Foreign key relationships are properly defined
- [ ] Indexes are created for all organization_id columns
- [ ] SQL migration script is created
- [ ] Documentation is updated

## References
- [Architecture Document](link-to-architecture-doc)
- [Database Schema Diagram](link-to-diagram)
```

## Milestone Planning

Create milestones that correspond to the phases in your roadmap:

1. Go to the "Issues" tab
2. Click "Milestones"
3. Click "New milestone"
4. Name it according to your roadmap phase (e.g., "Phase 1: Infrastructure Preparation")
5. Set a target date
6. Add a description that summarizes the goals of this phase

## Weekly Updates

To track progress consistently:

1. Every Friday, review all issues in the project
2. Update the status of each task
3. Move completed tasks to the "Done" column
4. Create a weekly summary in the repository discussions
5. Plan the next week's priorities

## Automation

Set up GitHub Actions to automate parts of your workflow:

1. Automatically move issues to "In Progress" when a branch is created
2. Move issues to "Review" when a pull request is created
3. Move issues to "Done" when a pull request is merged

## Example Workflow

1. Select a task from the "Todo" column
2. Create a branch for the issue: `git checkout -b feature/multi-tenant-db-schema`
3. Work on the implementation
4. Commit changes with meaningful messages that reference the issue: `git commit -m "Add organization_id to tables #42"`
5. Push the branch and create a pull request
6. Review and merge the pull request
7. Close the issue

## Viewing Progress

GitHub Projects provides several views to track progress:

1. **Board View**: Kanban-style visualization of tasks
2. **Table View**: Spreadsheet-like view with custom fields
3. **Roadmap View**: Timeline visualization for planning

Use these views to generate reports and share progress with stakeholders.

## Integration with ROADMAP.md

The ROADMAP.md file provides a high-level overview of the project plan. To maintain consistency:

1. When completing a task on the roadmap, update the checkbox in ROADMAP.md
2. Reference the corresponding GitHub issue number next to the task
3. Keep the "Current Status" section up to date

## Example:

```markdown
### Week 2: Multi-Tenant Database Design
- [x] Design organizations table schema (#12)
- [x] Update existing table schemas to include organization_id (#15)
- [ ] Design Row Level Security (RLS) policies (#18)
- [ ] Create database migration scripts
```

This approach ensures that your roadmap document always reflects the current state in GitHub Projects. 