// Add test user to database for email notifications
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'jarosquijano@gmail.com';
  const name = process.argv[3] || 'Jaros';
  
  console.log(`\n📧 Creating user: ${email}\n`);
  
  // Get current hour for digest time
  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0') + ':00';
  
  try {
    // Create or update user
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        notificationPreferences: {
          upsert: {
            create: {
              dailyDigest: true,
              dailyDigestTime: currentHour,
              overdueAlerts: true,
              dueTodayAlerts: true,
              dueTomorrowAlerts: true,
              assignedToMe: true,
              mentioned: true,
              cardComments: true,
              blockedAlerts: true,
              priorityEscalation: true,
            },
            update: {
              dailyDigestTime: currentHour,
            },
          },
        },
      },
      create: {
        clerkUserId: `test_${Date.now()}`,
        email,
        name,
        notificationPreferences: {
          create: {
            dailyDigest: true,
            dailyDigestTime: currentHour,
            overdueAlerts: true,
            dueTodayAlerts: true,
            dueTomorrowAlerts: true,
            assignedToMe: true,
            mentioned: true,
            cardComments: true,
            blockedAlerts: true,
            priorityEscalation: true,
          },
        },
      },
      include: {
        notificationPreferences: true,
      },
    });
    
    console.log('✅ User created successfully!\n');
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log(`Digest Time: ${user.notificationPreferences?.dailyDigestTime}\n`);
    console.log('🎉 Ready to receive emails!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();





