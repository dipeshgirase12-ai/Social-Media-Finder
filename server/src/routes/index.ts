import { Router } from 'express';
import { authController } from '../controllers/authController';
import { searchController, savedController } from '../controllers/searchController';
import { githubController, gitlabController, npmController, websiteController } from '../controllers/platformController';
import { adminController } from '../controllers/adminController';
import { optionalAuth, requireAuth, requireAdmin } from '../middleware/auth';
import { authLimiter, searchLimiter, apiLimiter, websiteLimiter } from '../middleware/rateLimiters';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/* ── Auth ──────────────────────────────────────────────── */
const auth = Router();
auth.post('/register', authLimiter, asyncHandler(authController.register));
auth.post('/login', authLimiter, asyncHandler(authController.login));
auth.post('/logout', asyncHandler(authController.logout));
auth.get('/me', requireAuth, asyncHandler(authController.me));
router.use('/auth', auth);

/* ── Search & history ──────────────────────────────────── */
const search = Router();
search.post('/', searchLimiter, optionalAuth, asyncHandler(searchController.search));
search.get('/history', requireAuth, asyncHandler(searchController.history));
search.delete('/history', requireAuth, asyncHandler(searchController.clearHistory));
search.get('/:id', optionalAuth, asyncHandler(searchController.getById));
search.delete('/:id', requireAuth, asyncHandler(searchController.remove));
search.get('/:id/export', requireAuth, asyncHandler(searchController.exportSearch));
router.use('/search', search);

/* ── Saved profiles ────────────────────────────────────── */
const saved = Router();
saved.get('/', requireAuth, asyncHandler(savedController.list));
saved.post('/', requireAuth, asyncHandler(savedController.save));
saved.delete('/:platform/:username', requireAuth, asyncHandler(savedController.remove));
router.use('/saved', saved);

/* ── Platform endpoints ────────────────────────────────── */
router.get('/github/users', apiLimiter, asyncHandler(githubController.searchUsers));
router.get('/github/users/:username', apiLimiter, asyncHandler(githubController.getUser));
router.get('/github/users/:username/repos', apiLimiter, asyncHandler(githubController.getUserRepos));
router.get('/github/repos/:owner/:repo', apiLimiter, asyncHandler(githubController.getRepo));

router.get('/gitlab/users', apiLimiter, asyncHandler(gitlabController.searchUsers));
router.get('/gitlab/users/:username', apiLimiter, asyncHandler(gitlabController.getUser));

router.get('/npm/search', apiLimiter, asyncHandler(npmController.search));
router.get('/website/analyze', websiteLimiter, asyncHandler(websiteController.analyze));

/* ── Admin ─────────────────────────────────────────────── */
router.get('/admin/stats', requireAdmin, asyncHandler(adminController.stats));

export default router;
