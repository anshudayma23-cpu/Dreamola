import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import bcrypt from 'bcryptjs';

async function main() {
  const { prisma } = await import('./src/lib/db');
  
  const email = 'anshudayma23@gmail.com';
  const password = 'daymaanshu';
  console.log(`Setting password and admin access for ${email}...`);

  const passwordHash = await bcrypt.hash(password, 10);
  const userClient = (prisma as any).user;

  const existing = await userClient.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (existing) {
    const updated = await userClient.update({
      where: { email: email.toLowerCase() },
      data: {
        passwordHash: passwordHash,
        isAdmin: true,
        role: 'admin',
        plan: 'premium',
      }
    });
    console.log(`Updated user ${email} with password 'daymaanshu' and ADMIN status:`, updated.email);
  } else {
    const created = await userClient.create({
      data: {
        email: email.toLowerCase(),
        username: 'anshu',
        displayName: 'Anshu (Admin)',
        passwordHash: passwordHash,
        isAdmin: true,
        role: 'admin',
        plan: 'premium',
      }
    });
    console.log(`Created new user ${email} with password 'daymaanshu' and ADMIN status:`, created.email);
  }
}

main()
  .catch((e) => {
    console.error(e);
  });
