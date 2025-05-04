import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Set the locale to Swedish
faker.locale = 'sv';

async function main() {
  console.log('🌱 Starting database seeding...');
  
  // Create a test organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'test-brf' },
    update: {},
    create: {
      name: 'Test BRF',
      slug: 'test-brf',
      domain: 'test.example.com',
    },
  });
  
  console.log(`✅ Created organization: ${organization.name} (${organization.id})`);

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      id: faker.string.uuid(),
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: new Date(),
      image: faker.image.avatar(),
    },
  });
  
  console.log(`✅ Created user: ${user.name} (${user.id})`);

  // Associate user with organization
  const userOrg = await prisma.userOrganization.upsert({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: organization.id,
      }
    },
    update: { role: 'ADMIN' },
    create: {
      userId: user.id,
      organizationId: organization.id,
      role: 'ADMIN',
      isDefault: true,
    }
  });
  
  console.log(`✅ Associated user with organization as ${userOrg.role}`);

  // Create test properties
  const properties = [];
  for (let i = 0; i < 3; i++) {
    const property = await prisma.property.create({
      data: {
        name: `${faker.location.street()} ${faker.number.int({min: 1, max: 99})}`,
        address: faker.location.streetAddress(),
        organizationId: organization.id,
      }
    });
    properties.push(property);
  }
  
  console.log(`✅ Created ${properties.length} properties`);

  // Create test units for each property
  for (const property of properties) {
    const unitCount = faker.number.int({min: 4, max: 10});
    for (let i = 0; i < unitCount; i++) {
      await prisma.unit.create({
        data: {
          unitNumber: `${faker.number.int({min: 1, max: 9})}${faker.string.numeric(2)}`,
          floor: faker.number.int({min: 0, max: 10}),
          size: faker.number.float({min: 35, max: 120, precision: 0.1}),
          rooms: faker.number.int({min: 1, max: 5}),
          propertyId: property.id,
          organizationId: organization.id,
        }
      });
    }
  }
  
  console.log(`✅ Created units for all properties`);

  // Create test documents for the organization
  const documentCategories = ['FINANCIAL', 'PROTOCOL', 'TECHNICAL', 'RULES', 'OTHER'];
  for (let i = 0; i < 8; i++) {
    await prisma.document.create({
      data: {
        title: faker.word.words(3),
        description: faker.word.words(10),
        fileUrl: `https://example.com/documents/${faker.string.uuid()}.pdf`,
        fileType: 'application/pdf',
        fileSize: faker.number.int({min: 100000, max: 5000000}),
        category: documentCategories[Math.floor(Math.random() * documentCategories.length)] as any,
        organizationId: organization.id,
      }
    });
  }
  
  console.log(`✅ Created test documents`);

  // Create test issues for the organization
  const issueStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  const issuePriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  
  for (let i = 0; i < 5; i++) {
    await prisma.issue.create({
      data: {
        title: faker.word.words({count: {min: 3, max: 6}}),
        description: faker.word.words({count: {min: 10, max: 30}}),
        status: issueStatuses[Math.floor(Math.random() * issueStatuses.length)] as any,
        priority: issuePriorities[Math.floor(Math.random() * issuePriorities.length)] as any,
        organizationId: organization.id,
      }
    });
  }
  
  console.log(`✅ Created test issues`);

  // Create subscription for the organization
  await prisma.subscription.upsert({
    where: { organizationId: organization.id },
    update: {},
    create: {
      planType: 'BASIC',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      organizationId: organization.id,
    }
  });
  
  console.log(`✅ Created subscription for organization`);

  console.log('✅ Database seeding completed successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 