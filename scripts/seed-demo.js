const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Upsert Demo Candidate
  const demoCandidate = await prisma.user.upsert({
    where: { email: 'demo@prismhrc.com' },
    update: { passwordHash, planTier: 'PRO' },
    create: {
      email: 'demo@prismhrc.com',
      name: 'Sarah Jenkins',
      passwordHash,
      role: 'CANDIDATE',
      planTier: 'PRO',
    },
  });
  console.log('Upserted user:', demoCandidate.email);

  // 2. Upsert Demo Recruiter / Admin
  const demoAdmin = await prisma.user.upsert({
    where: { email: 'admin@prismhrc.com' },
    update: { passwordHash, planTier: 'ENTERPRISE' },
    create: {
      email: 'admin@prismhrc.com',
      name: 'Elena Rostova (Recruiter)',
      passwordHash,
      role: 'ADMIN',
      planTier: 'ENTERPRISE',
    },
  });
  console.log('Upserted admin user:', demoAdmin.email);

  // 3. Upsert / update saniya's account password to 'password123'
  const saniyaUser = await prisma.user.upsert({
    where: { email: 'saniyamihani031@gmail.com' },
    update: { passwordHash, planTier: 'PRO' },
    create: {
      email: 'saniyamihani031@gmail.com',
      name: 'Saniya',
      passwordHash,
      role: 'CANDIDATE',
      planTier: 'PRO',
    },
  });
  console.log('Updated saniya user with password: password123');

  // Seed sample resumes for both demoCandidate and saniyaUser
  const sampleResumes = [
    {
      title: 'Senior AI/ML Engineer',
      templateId: 'ats-professional',
      atsScore: 92,
      content: {
        personal: {
          fullName: 'Arjun Mehta',
          email: 'arjun.mehta@email.com',
          phone: '+1 (415) 555-0172',
          location: 'San Francisco, CA',
          linkedin: 'linkedin.com/in/arjunmehta',
          github: 'github.com/arjunmehta',
        },
        headline: 'Senior AI/ML Engineer',
        summary: 'AI/ML Engineer with 6 years of experience designing and deploying production machine learning systems. Specialized in natural language processing, recommendation engines, and MLOps infrastructure.',
        experience: [
          {
            company: 'Nexus AI',
            role: 'Senior Machine Learning Engineer',
            location: 'San Francisco, CA',
            startDate: 'Jan 2022',
            endDate: 'Present',
            current: true,
            bullets: [
              'Designed and deployed a real-time recommendation engine serving 12M daily predictions with p99 latency under 50ms',
              'Built an end-to-end MLOps pipeline using Kubeflow, reducing model deployment time from 2 weeks to 4 hours',
              'Led a team of 4 engineers to develop a document understanding system using transformer models, improving extraction accuracy by 34%',
            ],
          },
          {
            company: 'DataStream Inc.',
            role: 'Machine Learning Engineer',
            location: 'Seattle, WA',
            startDate: 'Jun 2019',
            endDate: 'Dec 2021',
            current: false,
            bullets: [
              'Developed NLP models for sentiment analysis and entity extraction, processing 500K documents daily',
              'Optimized training pipelines on distributed GPU clusters, reducing training time by 45%',
            ],
          },
        ],
        education: [
          {
            institution: 'Stanford University',
            degree: 'Master of Science',
            field: 'Computer Science — Machine Learning',
            location: 'Stanford, CA',
            startDate: '2017',
            endDate: '2019',
          },
        ],
        skills: [
          { category: 'Machine Learning', skills: ['PyTorch', 'TensorFlow', 'Hugging Face', 'Scikit-learn'] },
          { category: 'MLOps & Cloud', skills: ['Docker', 'Kubernetes', 'AWS SageMaker', 'Kubeflow'] },
          { category: 'Languages', skills: ['Python', 'SQL', 'TypeScript', 'Bash'] },
        ],
        projects: [],
        certifications: [],
        achievements: [],
      },
    },
    {
      title: 'Full Stack Cloud Architect',
      templateId: 'modern-split',
      atsScore: 88,
      content: {
        personal: {
          fullName: 'Sarah Jenkins',
          email: 'sarah.jenkins@prismhrc.com',
          phone: '+1 (555) 234-5678',
          location: 'New York, NY',
          linkedin: 'linkedin.com/in/sarahjenkins',
        },
        headline: 'Lead Full Stack & Cloud Architect',
        summary: 'Accomplished software architect with 8+ years building enterprise SaaS platforms and leading distributed engineering teams.',
        experience: [
          {
            company: 'CloudScale Technologies',
            role: 'Principal Architect',
            location: 'New York, NY',
            startDate: '2021',
            endDate: 'Present',
            current: true,
            bullets: [
              'Architected microservices migration for 5 enterprise applications reducing latency by 40%',
              'Mentored 15+ senior developers across 3 international offices',
            ],
          },
        ],
        education: [
          {
            institution: 'Columbia University',
            degree: 'Bachelor of Science',
            field: 'Computer Science',
            location: 'New York, NY',
            startDate: '2013',
            endDate: '2017',
          },
        ],
        skills: [
          { category: 'Frontend', skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'] },
          { category: 'Backend & Cloud', skills: ['Node.js', 'PostgreSQL', 'Docker', 'AWS', 'Redis'] },
        ],
        projects: [],
        certifications: [],
        achievements: [],
      },
    },
  ];

  for (const user of [demoCandidate, saniyaUser, demoAdmin]) {
    const existingCount = await prisma.resume.count({ where: { userId: user.id } });
    if (existingCount === 0) {
      for (const res of sampleResumes) {
        await prisma.resume.create({
          data: {
            userId: user.id,
            title: res.title,
            templateId: res.templateId,
            atsScore: res.atsScore,
            content: res.content,
          },
        });
      }
      console.log(`Created sample resumes for ${user.email}`);
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
