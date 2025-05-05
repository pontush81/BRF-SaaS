import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { promisify } from 'util';

// Load environment variables
dotenv.config();
const execAsync = promisify(exec);

/**
 * Script to sync Prisma schema between development, staging, and production
 *
 * Usage:
 * ts-node src/scripts/sync-schema.ts [direction] [environment]
 *
 * direction: 'push' or 'pull' (default: 'push')
 * - push: push local schema to target environment
 * - pull: pull schema from target environment to local
 *
 * environment: 'staging' or 'production' (default: 'staging')
 */

// CLI arguments
const direction = process.argv[2] || 'push';
const targetEnv = process.argv[3] || 'staging';

// Configuration
const ENV_FILES = {
  staging: '.env.staging',
  production: '.env.production',
};

const SCHEMA_FILES = {
  local: 'prisma/schema.prisma',
  staging: 'prisma/schema.staging.prisma',
  production: 'prisma/schema.production.prisma',
};

// Ensure we have the required files
if (!fs.existsSync(SCHEMA_FILES.local)) {
  console.error(`❌ Local schema file not found: ${SCHEMA_FILES.local}`);
  process.exit(1);
}

// Paths to environment-specific .env files
const targetEnvFile = ENV_FILES[targetEnv as keyof typeof ENV_FILES];
const targetSchemaFile = SCHEMA_FILES[targetEnv as keyof typeof SCHEMA_FILES];

// Function to sync schema by extracting model definitions
async function syncSchema() {
  console.log(
    `🔄 Syncing schema ${direction === 'push' ? 'to' : 'from'} ${targetEnv} environment...`
  );

  try {
    // Load schema files
    const localSchema = fs.readFileSync(SCHEMA_FILES.local, 'utf8');
    let targetSchema = '';

    if (fs.existsSync(targetSchemaFile)) {
      targetSchema = fs.readFileSync(targetSchemaFile, 'utf8');
    } else if (direction === 'pull') {
      console.error(`❌ Target schema file not found: ${targetSchemaFile}`);
      process.exit(1);
    } else {
      // If pushing and target doesn't exist, create it by copying local
      targetSchema = localSchema;
    }

    // Extract model and enum definitions using regex
    const modelRegex = /(\s*model\s+\w+\s*{[\s\S]*?})/g;
    const enumRegex = /(\s*enum\s+\w+\s*{[\s\S]*?})/g;

    // Helper function to extract all matches from a regex
    const getAllMatches = (content: string, regex: RegExp): string[] => {
      const results: string[] = [];
      let match;
      // Reset lastIndex in case regex is reused
      regex.lastIndex = 0;

      while ((match = regex.exec(content)) !== null) {
        if (match[0]) {
          results.push(match[0].trim());
        }
      }
      return results;
    };

    const localModels = getAllMatches(localSchema, modelRegex);
    const localEnums = getAllMatches(localSchema, enumRegex);
    const targetModels = getAllMatches(targetSchema, modelRegex);
    const targetEnums = getAllMatches(targetSchema, enumRegex);

    // Extract generator and datasource blocks
    const extractBlock = (schema: string, blockType: string) => {
      const regex = new RegExp(
        `(\\s*${blockType}\\s+[\\s\\S]*?{[\\s\\S]*?})`,
        'g'
      );
      const match = regex.exec(schema);
      return match ? match[0].trim() : '';
    };

    const localGenerator = extractBlock(localSchema, 'generator');
    const localDatasource = extractBlock(localSchema, 'datasource');
    const targetGenerator = extractBlock(targetSchema, 'generator');
    const targetDatasource = extractBlock(targetSchema, 'datasource');

    // Perform the sync based on direction
    if (direction === 'push') {
      // Update target schema with local models while preserving target's generator/datasource
      const updatedSchema = [
        targetGenerator || localGenerator,
        targetDatasource || localDatasource,
        ...localModels,
        ...localEnums,
      ].join('\n\n');

      fs.writeFileSync(targetSchemaFile, updatedSchema);
      console.log(`✅ Successfully pushed schema to ${targetSchemaFile}`);

      // Run Prisma format on the schema
      await execAsync(`npx prisma format --schema=${targetSchemaFile}`);
      console.log('✅ Schema formatted with Prisma');
    } else if (direction === 'pull') {
      // Update local schema with target models while preserving local's generator/datasource
      const updatedSchema = [
        localGenerator,
        localDatasource,
        ...targetModels,
        ...targetEnums,
      ].join('\n\n');

      // Create a backup of the local schema
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `${SCHEMA_FILES.local}.backup-${timestamp}`;
      fs.copyFileSync(SCHEMA_FILES.local, backupPath);
      console.log(`✅ Created backup of local schema at ${backupPath}`);

      // Update the local schema
      fs.writeFileSync(SCHEMA_FILES.local, updatedSchema);
      console.log(`✅ Successfully pulled schema from ${targetEnv} to local`);

      // Run Prisma format on the schema
      await execAsync(`npx prisma format`);
      console.log('✅ Schema formatted with Prisma');
    }

    console.log(
      `\n🔍 Comparing differences (${direction === 'push' ? 'local → ' + targetEnv : targetEnv + ' → local'}):`
    );

    console.log(
      `Models in ${direction === 'push' ? 'local' : targetEnv}: ${direction === 'push' ? localModels.length : targetModels.length}`
    );
    console.log(
      `Models in ${direction === 'push' ? targetEnv : 'local'}: ${direction === 'push' ? targetModels.length : localModels.length}`
    );

    console.log(
      `Enums in ${direction === 'push' ? 'local' : targetEnv}: ${direction === 'push' ? localEnums.length : targetEnums.length}`
    );
    console.log(
      `Enums in ${direction === 'push' ? targetEnv : 'local'}: ${direction === 'push' ? targetEnums.length : localEnums.length}`
    );

    // Suggest next steps
    console.log(`
✨ Schema sync complete!

Next steps:
${
  direction === 'push'
    ? `- Push the changes to Supabase: npm run prisma:db:push:${targetEnv}`
    : `- Generate Prisma client: npm run prisma generate
- Run migrations if needed: npm run prisma migrate dev`
}
- Verify the changes with Prisma Studio: ${
      direction === 'push'
        ? `npm run prisma:studio:${targetEnv}`
        : 'npx prisma studio'
    }
`);
  } catch (error) {
    console.error('❌ Error syncing schema:', error);
    process.exit(1);
  }
}

// Run the sync
syncSchema();
