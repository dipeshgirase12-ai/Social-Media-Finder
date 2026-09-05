import type { Request, Response } from 'express';
import { runSearch } from '../services/search/searchService';
import { Search } from '../models/Search';
import { SavedProfile } from '../models/SavedProfile';
import { parseBody, searchSchema, saveProfileSchema } from '../validation/schemas';
import { ApiError } from '../utils/apiError';

export const searchController = {
  /** POST /api/search */
  async search(req: Request, res: Response): Promise<void> {
    const { query } = parseBody(searchSchema, req.body);
    const payload = await runSearch(query, req.user?.sub);
    res.json({ success: true, ...payload });
  },

  /** GET /api/search/:id — stored summary of a previous search. */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!/^[a-f\d]{24}$/i.test(id)) throw ApiError.badRequest('INVALID_ID', 'Invalid search id.');
    const doc = await Search.findById(id).lean();
    if (!doc) throw ApiError.notFound('Search not found or expired.');
    res.json({
      success: true,
      search: {
        id: String(doc._id),
        query: doc.query,
        queryType: doc.queryType,
        profiles: doc.profiles,
        repositoryCount: doc.repositoryCount,
        websiteCount: doc.websiteCount,
        packageCount: doc.packageCount,
        platformStates: doc.platformStates,
        durationMs: doc.durationMs,
        createdAt: doc.createdAt,
      },
    });
  },

  /** GET /api/search/history (auth) */
  async history(req: Request, res: Response): Promise<void> {
    if (!req.user) throw ApiError.unauthorized();
    const limit = Math.min(Number(req.query.limit ?? 20) || 20, 50);
    const docs = await Search.find({ userId: req.user.sub })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('query queryType repositoryCount websiteCount packageCount durationMs createdAt')
      .lean();
    res.json({
      success: true,
      history: docs.map((d) => ({
        id: String(d._id),
        query: d.query,
        queryType: d.queryType,
        repositoryCount: d.repositoryCount,
        websiteCount: d.websiteCount,
        packageCount: d.packageCount,
        durationMs: d.durationMs,
        createdAt: d.createdAt,
      })),
    });
  },

  /** DELETE /api/search/:id (auth, own records only) */
  async remove(req: Request, res: Response): Promise<void> {
    if (!req.user) throw ApiError.unauthorized();
    const { id } = req.params;
    if (!/^[a-f\d]{24}$/i.test(id)) throw ApiError.badRequest('INVALID_ID', 'Invalid search id.');
    const result = await Search.deleteOne({ _id: id, userId: req.user.sub });
    if (result.deletedCount === 0) throw ApiError.notFound('Search not found.');
    res.json({ success: true });
  },

  /** DELETE /api/search/history (auth) — clear all */
  async clearHistory(req: Request, res: Response): Promise<void> {
    if (!req.user) throw ApiError.unauthorized();
    await Search.deleteMany({ userId: req.user.sub });
    res.json({ success: true });
  },

  /** GET /api/search/:id/export?format=json|csv (auth, own records only) */
  async exportSearch(req: Request, res: Response): Promise<void> {
    if (!req.user) throw ApiError.unauthorized();
    const { id } = req.params;
    if (!/^[a-f\d]{24}$/i.test(id)) throw ApiError.badRequest('INVALID_ID', 'Invalid search id.');
    const doc = await Search.findOne({ _id: id, userId: req.user.sub }).lean();
    if (!doc) throw ApiError.notFound('Search not found.');

    const format = req.query.format === 'csv' ? 'csv' : 'json';
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="devtrace-search-${id}.json"`);
      res.json(doc);
      return;
    }
    // CSV of profile matches.
    const rows = [['platform', 'username', 'displayName', 'profileUrl', 'confidence', 'confidenceLabel']];
    for (const p of doc.profiles ?? []) {
      rows.push([
        p.platform ?? '',
        p.username ?? '',
        p.displayName ?? '',
        p.profileUrl ?? '',
        p.confidence !== undefined ? String(p.confidence) : '',
        p.confidenceLabel ?? '',
      ]);
    }
    const csv = rows
      .map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="devtrace-search-${id}.csv"`);
    res.send(csv);
  },
};

export const savedController = {
  /** GET /api/saved (auth) */
  async list(req: Request, res: Response): Promise<void> {
    if (!req.user) throw ApiError.unauthorized();
    const docs = await SavedProfile.find({ userId: req.user.sub }).sort({ createdAt: -1 }).lean();
    res.json({
      success: true,
      saved: docs.map((d) => ({
        id: String(d._id),
        platform: d.platform,
        username: d.username,
        displayName: d.displayName,
        avatarUrl: d.avatarUrl,
        profileUrl: d.profileUrl,
        bio: d.bio,
        confidence: d.confidence,
        savedAt: d.createdAt,
      })),
    });
  },

  /** POST /api/saved (auth) */
  async save(req: Request, res: Response): Promise<void> {
    if (!req.user) throw ApiError.unauthorized();
    const data = parseBody(saveProfileSchema, req.body);
    const doc = await SavedProfile.findOneAndUpdate(
      { userId: req.user.sub, platform: data.platform, username: data.username },
      { $set: data },
      { upsert: true, new: true }
    );
    res.status(201).json({ success: true, id: String(doc._id) });
  },

  /** DELETE /api/saved/:platform/:username (auth) */
  async remove(req: Request, res: Response): Promise<void> {
    if (!req.user) throw ApiError.unauthorized();
    const { platform, username } = req.params;
    await SavedProfile.deleteOne({ userId: req.user.sub, platform, username });
    res.json({ success: true });
  },
};
