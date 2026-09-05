import { describe, it, expect, vi } from 'vitest';
import { analyzeWebsite } from '../src/services/website/websiteService';

describe('website metadata preview extraction', () => {
  it('captures a preview image URL from open graph metadata', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          `
            <html>
              <head>
                <title>Demo Portfolio</title>
                <meta property="og:title" content="Demo Portfolio" />
                <meta property="og:description" content="Designing software for teams" />
                <meta property="og:image" content="https://example.com/preview.png" />
              </head>
              <body>
                <a href="https://github.com/demo">GitHub</a>
              </body>
            </html>
          `,
          { headers: { 'content-type': 'text/html; charset=utf-8' } },
        ),
      ),
    );

    const result = await analyzeWebsite('https://example.com');

    expect(result.previewUrl).toBe('https://example.com/preview.png');
    expect(result.title).toBe('Demo Portfolio');
  });
});
