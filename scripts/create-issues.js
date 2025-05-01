require('dotenv').config();
const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  owner: 'pontush81',
  repo: 'BRF-SaaS',
  token: process.env.GITHUB_TOKEN,
  projectNumber: 1, // Your GitHub project number
  issuesFile: process.argv[2] || 'ISSUES.md'
};

// Initialize Octokit with preview headers
const octokit = new Octokit({
  auth: config.token,
  previews: ['inertia-preview']
});

// Get project ID using GraphQL
async function getProjectId() {
  const query = `
    query {
      user(login: "${config.owner}") {
        projectV2(number: ${config.projectNumber}) {
          id
        }
      }
    }
  `;

  try {
    const result = await octokit.graphql(query);
    return result.user.projectV2.id;
  } catch (error) {
    console.error('Error getting project ID:', error.message);
    throw error;
  }
}

// Add an issue to the project
async function addIssueToProject(issueNodeId, projectId) {
  const mutation = `
    mutation {
      addProjectV2ItemById(input: {
        projectId: "${projectId}"
        contentId: "${issueNodeId}"
      }) {
        item {
          id
        }
      }
    }
  `;

  try {
    await octokit.graphql(mutation);
    return true;
  } catch (error) {
    console.error('Error adding issue to project:', error.message);
    return false;
  }
}

// Parse the issues from ISSUES.md
function parseIssues(content) {
  const issues = [];
  let currentIssue = null;
  
  const lines = content.split('\n');
  
  for (let line of lines) {
    // New issue starts with "title:"
    if (line.startsWith('title:')) {
      if (currentIssue) {
        issues.push(currentIssue);
      }
      currentIssue = {
        title: line.replace('title:', '').trim(),
        body: '',
        labels: [],
        milestone: null,
        assignee: null
      };
    }
    // Labels
    else if (line.startsWith('labels:')) {
      currentIssue.labels = line
        .replace('labels:', '')
        .trim()
        .split(',')
        .map(label => label.trim());
    }
    // Milestone
    else if (line.startsWith('milestone:')) {
      currentIssue.milestone = line.replace('milestone:', '').trim();
    }
    // Assignee
    else if (line.startsWith('assignee:')) {
      currentIssue.assignee = line.replace('assignee:', '').trim();
    }
    // Add to body
    else if (currentIssue) {
      currentIssue.body += line + '\n';
    }
  }
  
  // Don't forget the last issue
  if (currentIssue) {
    issues.push(currentIssue);
  }
  
  return issues;
}

// Create a single issue
async function createIssue(issue, projectId) {
  try {
    // Get milestone ID
    let milestoneId = null;
    if (issue.milestone) {
      const milestones = await octokit.issues.listMilestones({
        owner: config.owner,
        repo: config.repo
      });
      
      const milestone = milestones.data.find(m => m.title === issue.milestone);
      if (milestone) {
        milestoneId = milestone.number;
      } else {
        // Create milestone if it doesn't exist
        const newMilestone = await octokit.issues.createMilestone({
          owner: config.owner,
          repo: config.repo,
          title: issue.milestone
        });
        milestoneId = newMilestone.data.number;
      }
    }
    
    // Create the issue
    const response = await octokit.issues.create({
      owner: config.owner,
      repo: config.repo,
      title: issue.title,
      body: issue.body,
      labels: issue.labels,
      milestone: milestoneId,
      assignee: issue.assignee
    });

    // Add issue to project
    if (projectId) {
      const success = await addIssueToProject(response.data.node_id, projectId);
      if (success) {
        console.log(`Added issue to project: ${issue.title}`);
      }
    }
    
    console.log(`Created issue: ${issue.title}`);
    return response.data;
  } catch (error) {
    console.error(`Error creating issue "${issue.title}":`, error.message);
    return null;
  }
}

// Main function
async function main() {
  try {
    // Check for GitHub token
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN environment variable is required');
    }
    
    // Get project ID
    console.log('Getting project ID...');
    const projectId = await getProjectId();
    console.log(`Using project ID: ${projectId}`);
    
    // Read the issues file
    const content = fs.readFileSync(
      path.join(__dirname, '..', config.issuesFile),
      'utf8'
    );
    
    // Parse issues
    const issues = parseIssues(content);
    console.log(`Found ${issues.length} issues to create from ${config.issuesFile}`);
    
    // Create issues sequentially to avoid rate limiting
    for (const issue of issues) {
      await createIssue(issue, projectId);
      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('Finished creating issues');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main(); 