import type { Request, Response } from 'express';
import { User } from '../models/User';
import { Search } from '../models/Search';
import { getGithubCallCount } from '../services/github/githubService';

export const adminController = {
  /** GET /api/admin/stats (admin only) */
  async stats(_req: Request, res: Response): Promise<void> {
    const [totalUsers, totalSearches] = await Promise.all([User.countDocuments(), Search.countDocuments()]);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const searchesToday = await Search.countDocuments({ createdAt: { $gte: startOfDay } });

    const avgAgg = await Search.aggregate<{ avg: number }>([
      { $group: { _id: null, avg: { $avg: '$durationMs' } } },
    ]);

    const popular = await Search.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$query', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    const errorsAgg = await Search.aggregate<{ _id: string; count: number }>([
      { $unwind: '$platformStates' },
      { $match: { 'platformStates.status': { $in: ['ERROR', 'RATE_LIMITED'] } } },
      { $group: { _id: '$platformStates.platform', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalSearches,
        searchesToday,
        avgSearchTimeMs: avgAgg[0] ? Math.round(avgAgg[0].avg) : 0,
        githubApiCallsThisProcess: getGithubCallCount(),
        popularQueries: popular.map((p) => ({ query: p._id, count: p.count })),
        providerErrors: errorsAgg.map((e) => ({ platform: e._id, count: e.count })),
      },
    });
  },
};
