'use strict';

/**
 * Database seeder for HireSense.
 * Creates sample Admin + Job postings to demonstrate the platform.
 * Run with: node src/scripts/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin.model');
const Job = require('../models/Job.model');
const { env } = require('../config/env');

const JOBS = [
  {
    title: 'Senior Frontend Engineer',
    company: 'Stripe',
    description: 'Build next-generation payment UIs used by millions. Own the full frontend stack.',
    status: 'active',
    requirements: {
      requiredSkills: ['react', 'typescript', 'next.js', 'graphql', 'css', 'git'],
      minExperienceYears: 4,
      educationLevel: 'bachelor',
    },
    location: { city: 'San Francisco', state: 'CA', country: 'US', isRemote: true },
  },
  {
    title: 'Full Stack Developer',
    company: 'Linear',
    description: 'Work on the core product that engineers love. React, Node, Postgres stack.',
    status: 'active',
    requirements: {
      requiredSkills: ['react', 'node.js', 'typescript', 'postgresql', 'docker', 'git'],
      minExperienceYears: 3,
      educationLevel: 'bachelor',
    },
    location: { city: 'Remote', isRemote: true },
  },
  {
    title: 'Backend Engineer (Node.js)',
    company: 'Vercel',
    description: 'Scale our infrastructure to handle billions of deployments. Deep Node.js expertise required.',
    status: 'active',
    requirements: {
      requiredSkills: ['node.js', 'aws', 'docker', 'kubernetes', 'mongodb', 'redis'],
      minExperienceYears: 3,
      educationLevel: 'bachelor',
    },
    location: { city: 'Remote', isRemote: true },
  },
  {
    title: 'ML Engineer',
    company: 'Anthropic',
    description: 'Research and build safe AI systems. Python and deep learning experience essential.',
    status: 'active',
    requirements: {
      requiredSkills: ['python', 'pytorch', 'machine learning', 'deep learning', 'tensorflow'],
      minExperienceYears: 5,
      educationLevel: 'master',
    },
    location: { city: 'San Francisco', state: 'CA', country: 'US', isRemote: false },
  },
  {
    title: 'DevOps Engineer',
    company: 'HashiCorp',
    description: 'Maintain and evolve our cloud infrastructure. Terraform expertise is a must.',
    status: 'active',
    requirements: {
      requiredSkills: ['aws', 'terraform', 'kubernetes', 'docker', 'ci/cd', 'linux', 'bash'],
      minExperienceYears: 4,
      educationLevel: 'bachelor',
    },
    location: { city: 'Remote', isRemote: true },
  },
  {
    title: 'React Native Developer',
    company: 'Raycast',
    description: 'Build beautiful, performant cross-platform mobile apps for power users.',
    status: 'active',
    requirements: {
      requiredSkills: ['react', 'typescript', 'node.js', 'git', 'rest api'],
      minExperienceYears: 2,
      educationLevel: 'bachelor',
    },
    location: { city: 'Berlin', country: 'Germany', isRemote: true },
  },
  {
    title: 'Software Engineer (Backend)',
    company: 'GitHub',
    description: 'Contribute to the platform used by 100M developers worldwide. Ruby & Go stack.',
    status: 'active',
    requirements: {
      requiredSkills: ['go', 'postgresql', 'redis', 'docker', 'git', 'microservices'],
      minExperienceYears: 3,
      educationLevel: 'bachelor',
    },
    location: { city: 'Remote', isRemote: true },
  },
  {
    title: 'Data Engineer',
    company: 'Figma',
    description: 'Build pipelines to understand how millions of designers use our product.',
    status: 'active',
    requirements: {
      requiredSkills: ['python', 'sql', 'aws', 'elasticsearch', 'nosql'],
      minExperienceYears: 2,
      educationLevel: 'bachelor',
    },
    location: { city: 'New York', state: 'NY', isRemote: true },
  },
];

async function seed() {
  console.log('🌱 Connecting to database…');
  await mongoose.connect(env.mongo.uri);
  console.log('✅ Connected.\n');

  // Create Admin
  console.log('Creating admin user…');
  const existingAdmin = await Admin.findOne({ email: 'admin@hiresense.io' });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash('Admin@123!', 12);
    await Admin.create({
      name: 'HireSense Admin',
      email: 'admin@hiresense.io',
      password: hashed,
      role: 'superadmin',
    });
    console.log('✅ Admin created: admin@hiresense.io / Admin@123!\n');
  } else {
    console.log('ℹ️  Admin already exists, skipping.\n');
  }

  // Seed Jobs
  console.log('Seeding jobs…');
  const adminDoc = await Admin.findOne({ email: 'admin@hiresense.io' });
  let created = 0;
  for (const jobData of JOBS) {
    const exists = await Job.findOne({ title: jobData.title, company: jobData.company });
    if (!exists) {
      await Job.create({ ...jobData, postedBy: adminDoc._id });
      console.log(`  ✅ Created: ${jobData.title} @ ${jobData.company}`);
      created++;
    } else {
      console.log(`  ℹ️  Exists: ${jobData.title} @ ${jobData.company}`);
    }
  }
  console.log(`\n🎉 Seeding complete. ${created} new job(s) added.`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
