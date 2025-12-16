import { Request, Response, NextFunction } from 'express'
import prisma from '../lib/prisma'

type ResourceOpts = { resourceType?: string; resourceId?: string }

const permissionCache = new Map<string, number>()

async function getPermissionId(name: string): Promise<number | null> {
  if (permissionCache.has(name)) return permissionCache.get(name)!
  const p = await prisma.permission.findUnique({ where: { name } })
  if (!p) return null
  permissionCache.set(name, p.id)
  return p.id
}

/**
 * Resolve whether a user has a permission.
 * Resolution order: exact resource -> resourceType global -> global.
 * Deny has precedence over allow.
 */
export async function hasPermission(
  userId: string,
  permissionName: string,
  opts: ResourceOpts = {}
): Promise<boolean> {
  const permissionId = await getPermissionId(permissionName)
  if (!permissionId) return false

  const { resourceType, resourceId } = opts

  const whereClauses: any[] = []

  if (resourceType && resourceId) {
    whereClauses.push({
      userId,
      permissionId,
      resourceType,
      resourceId,
    })
  }

  if (resourceType) {
    whereClauses.push({
      userId,
      permissionId,
      resourceType,
      resourceId: null,
    })
  }

  // global grant
  whereClauses.push({
    userId,
    permissionId,
    resourceType: null,
    resourceId: null,
  })

  const grants = await prisma.userPermission.findMany({ where: { OR: whereClauses } })

  if (!grants || grants.length === 0) return false

  // If any DENY exists -> deny
  if (grants.some((g) => g.grant === 'DENY' || g.grant === 'Deny')) return false

  // If any ALLOW exists -> allow
  if (grants.some((g) => g.grant === 'ALLOW' || g.grant === 'Allow')) return true

  return false
}

function makeError(status: number, message: string) {
  const err: any = new Error(message)
  err.status = status
  return err
}

/**
 * Express middleware factory to require a permission.
 * Options:
 * - resourceType: string | undefined
 * - param: name of req.params to use as resourceId
 */
export function requirePermission(
  permissionName: string,
  options: { resourceType?: string; param?: string } = {}
) {
  return async function (req: Request, _res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || (req as any).session?.userId || (req as any).userId
      if (!userId) return next(makeError(401, 'Unauthorized'))

      let resourceId: string | undefined = undefined
      if (options.param) {
        resourceId = req.params?.[options.param]
      }

      const allowed = await hasPermission(userId, permissionName, {
        resourceType: options.resourceType,
        resourceId,
      })

      if (!allowed) return next(makeError(403, 'Forbidden'))
      return next()
    } catch (err) {
      return next(err)
    }
  }
}

export default { hasPermission, requirePermission }
