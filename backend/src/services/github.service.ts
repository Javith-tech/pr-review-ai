import { Octokit } from '@octokit/rest';
import { env } from '../config/env';
import type { PrMetadata, PrFile } from '../types';
import { logger } from '../utils';

export class GitHubService {
  private octokit: Octokit;

  constructor(userToken?: string) {
    console.log(
      '[GITHUB SERVICE] Using token:',
      userToken ? 'user token' : env.GITHUB_TOKEN ? 'env token' : 'no token'
    );
    this.octokit = new Octokit({
      auth: userToken || env.GITHUB_TOKEN,
    });
  }

  async getPrMetadata(owner: string, repo: string, pullNumber: number): Promise<PrMetadata> {
    try {
      logger.info(`Fetching PR metadata for ${owner}/${repo}#${pullNumber}`);

      const { data: pr } = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
      });

      return {
        owner,
        repo,
        pullNumber,
        title: pr.title,
        author: pr.user?.login || 'unknown',
        baseRef: pr.base.ref,
        headRef: pr.head.ref,
      };
    } catch (error) {
      logger.error('Failed to fetch PR metadata', error);

      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status;
        const errorMessage = (error as any)?.response?.data?.message || '';

        if (status === 404) {
          throw new Error(
            'PR not found. Please check the URL and ensure the repository is public.'
          );
        }
        if (status === 403) {
          if (errorMessage.includes('OAuth App access restrictions')) {
            throw new Error(
              'Access denied. This organization has OAuth App access restrictions enabled. Please grant access to this app in your GitHub settings.'
            );
          }
          throw new Error('Access denied. The repository may be private or rate limit exceeded.');
        }
      }

      throw new Error('Failed to fetch PR metadata from GitHub');
    }
  }

  async getPrFiles(owner: string, repo: string, pullNumber: number): Promise<PrFile[]> {
    try {
      logger.info(`Fetching PR files for ${owner}/${repo}#${pullNumber}`);

      const { data: files } = await this.octokit.pulls.listFiles({
        owner,
        repo,
        pull_number: pullNumber,
        per_page: 100,
      });

      return files.map(
        (file): PrFile => ({
          filename: file.filename,
          status: file.status,
          additions: file.additions,
          deletions: file.deletions,
          changes: file.changes,
          patch: file.patch,
        })
      );
    } catch (error) {
      logger.error('Failed to fetch PR files', error);

      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status;
        const errorMessage = (error as any)?.response?.data?.message || '';

        console.log('[GITHUB] PR files fetch failed with status:', status);
        if (status === 404) {
          throw new Error('PR not found. Please check the URL.');
        }
        if (status === 403) {
          if (errorMessage.includes('OAuth App access restrictions')) {
            throw new Error(
              'Access denied. This organization has OAuth App access restrictions enabled. Please grant access to this app in your GitHub settings.'
            );
          }
          throw new Error('Access denied. You may not have access to this private repository.');
        }
      }

      throw new Error('Failed to fetch PR files from GitHub');
    }
  }
}

export const githubService = new GitHubService();
