import express from 'express'
import prisma from '../lib/prisma'
import { requireAdmin } from '../middleware/auth.middleware'

const router = express.Router()

function makeError(status: number, message: string) {
  const err: any = new Error(message)
  err.status = status
  return err
}

// Permissions CRUD
router.get('/permissions', requireAdmin, async (req, res, next) => {
  try {
    const perms = await prisma.permission.findMany({ orderBy: { name: 'asc' } })
    res.json(perms)
  } catch (err) {
    next(err)
  }
})

router.post('/permissions', requireAdmin, async (req, res, next) => {
  try {
    const { name } = req.body
    if (!name) return next(makeError(400, 'Missing permission name'))
    const perm = await prisma.permission.create({ data: { name } })
    res.status(201).json(perm)
  } catch (err: any) {
    if (err.code === 'P2002') return next(makeError(409, 'Permission already exists'))
    next(err)
  }
})

// UserPermission management
router.get('/user-permissions', requireAdmin, async (req, res, next) => {
  try {
    const { userId } = req.query
    const where: any = {}
    if (userId) where.userId = String(userId)
    const grants = await prisma.userPermission.findMany({ where, include: { permission: true } })
    res.json(grants)
  } catch (err) {
    next(err)
  }
})

router.post('/user-permissions', requireAdmin, async (req, res, next) => {
  try {
    const { userId, permissionName, grant = 'ALLOW', resourceType = null, resourceId = null, createdBy = null } = req.body
    if (!userId || !permissionName) return next(makeError(400, 'Missing userId or permissionName'))

    // Resolve permission
    let permission = await prisma.permission.findUnique({ where: { name: permissionName } })
    if (!permission) {
      // Optionally create the permission automatically
      permission = await prisma.permission.create({ data: { name: permissionName } })
    }

    // Prisma does not support upsert on composite unique keys with nullable fields.
    // Use a find -> update/create flow to handle nullable `resourceType`/`resourceId`.
    const existing = await prisma.userPermission.findFirst({
      where: {
        userId: String(userId),
        permissionId: permission.id,
        resourceType: resourceType ?? null,
        resourceId: resourceId ?? null,
      }
    })

    let result
    if (existing) {
      result = await prisma.userPermission.update({ where: { id: existing.id }, data: { grant, createdBy } })
    } else {
      result = await prisma.userPermission.create({ data: { userId: String(userId), permissionId: permission.id, grant, resourceType, resourceId, createdBy } })
    }

    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
})

router.delete('/user-permissions/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!id) return next(makeError(400, 'Invalid id'))
    await prisma.userPermission.delete({ where: { id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export default router
