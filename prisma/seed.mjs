import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Simplified permission model: per-category `manage` only.
// `manage` implies the ability to view, create, read, update and delete for the category.
const PERMISSIONS = [
  'courses.manage',
  'questions.manage',
  'quizzes.manage',
  'packages.manage',
  'purchases.manage',
  'users.manage',
  'referral.manage',
  'system.manage',
  'permissions.manage'
]

async function upsertPermissions() {
  const results = []
  for (const name of PERMISSIONS) {
    const p = await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name }
    })
    results.push(p)
  }
  return results
}

async function bootstrapAdmin(adminId) {
  if (!adminId) return
  const perms = await prisma.permission.findMany()
  for (const perm of perms) {
    const where = {
      userId_permissionId_resourceType_resourceId: {
        userId: adminId,
        permissionId: perm.id,
        resourceType: null,
        resourceId: null
      }
    }

    await prisma.userPermission.upsert({
      where,
      update: { grant: 'ALLOW' },
      create: {
        userId: adminId,
        permissionId: perm.id,
        grant: 'ALLOW',
        resourceType: null,
        resourceId: null,
        createdBy: 'seed'
      }
    })
  }
}

async function main() {
  console.log('Seeding permissions...')
  await upsertPermissions()
  const adminId = process.env.BOOTSTRAP_ADMIN_ID || process.env.ADMIN_USER_ID
  if (adminId) {
    console.log('Bootstrapping admin grants for', adminId)
    await bootstrapAdmin(adminId)
  } else {
    console.log('No BOOTSTRAP_ADMIN_ID provided; skipping admin grant bootstrap')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
