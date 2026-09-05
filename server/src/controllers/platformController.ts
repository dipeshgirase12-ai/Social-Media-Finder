import type { Request, Response } from 'express';
import { githubService } from '../services/github/githubService';
import { gitlabService } from '../services/gitlab/gitlabService';
import { npmService } from '../services/npm/npmService';
import { analyzeWebsite } from '../services/website/websiteService';
import { inferSkills } from '../services/matching/skills';
import { parseQuery, githubUsersQuery, usernameParam, gitlabUsernameParam, repoParam, npmSearchQuery, websiteAnalyzeQuery } from '../validation/schemas';

export const githubController = {
  /** GET /api/github/users?q= */
  async searchUsers(req: Request, res: Response): Promise<void> {
    const { q, limit } = parseQuery(githubUsersQuery, req.query);
    const users = await githubService.searchUsers(q, limit ?? 5);
    res.json({ success: true, users });
  },

  /** GET /api/github/users/:username */
  async getUser(req: Request, res: Response): Promise<void> {
    const { username } = parseQuery(usernameParam, req.params);
    const user = await githubService.getUser(username);
    res.json({ success: true, user });
  },

  /** GET /api/github/users/:username/repos */
  async getUserRepos(req: Request, res: Response): Promise<void> {
    const { username } = parseQuery(usernameParam, req.params);
    const repos = await githubService.getRepositories(username, 30);
    res.json({ success: true, repositories: repos, skills: inferSkills(repos) });
  },

  /** GET /api/github/repos/:owner/:repo */
  async getRepo(req: Request, res: Response): Promise<void> {
    const { owner, repo } = parseQuery(repoParam, req.params);
    const repository = await githubService.getRepository(owner, repo);
    res.json({ success: true, repository });
  },
};

export const gitlabController = {
  /** GET /api/gitlab/users?q= */
  async searchUsers(req: Request, res: Response): Promise<void> {
    const { q, limit } = parseQuery(githubUsersQuery, req.query);
    const users = await gitlabService.searchUsers(q, limit ?? 5);
    res.json({ success: true, users });
  },

  /** GET /api/gitlab/users/:username */
  async getUser(req: Request, res: Response): Promise<void> {
    const { username } = parseQuery(gitlabUsernameParam, req.params);
    const user = await gitlabService.getUser(username);
    const projects = user ? await gitlabService.getUserProjects(username, 10) : [];
    res.json({ success: true, user, projects });
  },
};

export const npmController = {
  /** GET /api/npm/search?q= */
  async search(req: Request, res: Response): Promise<void> {
    const { q, limit } = parseQuery(npmSearchQuery, req.query);
    const packages = await npmService.searchPackages(q, limit ?? 8);
    res.json({ success: true, packages });
  },
};

export const websiteController = {
  /** GET /api/website/analyze?url= */
  async analyze(req: Request, res: Response): Promise<void> {
    const { url } = parseQuery(websiteAnalyzeQuery, req.query);
    const metadata = await analyzeWebsite(url);
    res.json({ success: true, website: metadata });
  },
};
