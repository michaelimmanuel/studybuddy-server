import express from 'express'
import { hasPermission, requirePermission } from '../middleware/access.middleware'

const router = express.Router()

// Returns the resolved global permissions attached to the request (from attachPermissionsToRequest)
router.get('/permissions', (req, res) => {
  res.json({ permissions: (req as any).permissions || (req as any).session?.permissions || [] })
})

// Check a specific permission name for the current user
router.get('/permissions/check/:perm', async (req, res, next) => {
  try {
    const userId = (req as any).user?.id || (req as any).session?.userId
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    const perm = req.params.perm
    const allowed = await hasPermission(userId, perm)
    return res.json({ permission: perm, allowed })
  } catch (err) {
    return next(err)
  }
})

// Example protected endpoint using middleware
router.get('/protected', requirePermission('users.view'), (req, res) => {
  res.json({ ok: true, msg: 'You can view users' })
})

export default router
