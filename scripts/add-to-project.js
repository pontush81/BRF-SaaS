require('dotenv').config();
const { Octokit } = require('@octokit/rest');

// Configuration
const config = {
  owner: 'pontush81',
  repo: 'BRF-SaaS',
  token: process.env.GITHUB_TOKEN,
  projectNumber: 1
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
    
    // Get all issues from Phase 1
    console.log('Fetching Phase 1 issues...');
    const { data: issues } = await octokit.issues.listForRepo({
      owner: config.owner,
      repo: config.repo,
      milestone: 1,
      state: 'all'
    });

    console.log(`Found ${issues.length} Phase 1 issues`);
    
    // Add each issue to the project
    for (const issue of issues) {
      console.log(`Adding issue #${issue.number}: ${issue.title}`);
      const success = await addIssueToProject(issue.node_id, projectId);
      if (success) {
        console.log('Successfully added to project');
      }
      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('Finished adding issues to project');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main(); 