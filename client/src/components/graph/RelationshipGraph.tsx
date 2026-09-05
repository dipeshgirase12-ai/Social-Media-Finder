import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch } from 'lucide-react';
import type { PublicProfile, PublicRepository } from '../../types';
import { PLATFORM_COLORS, PLATFORM_LABELS } from '../../lib/format';

interface GraphNode {
  id: string;
  label: string;
  platform: string;
  x: number;
  y: number;
  url?: string;
}

interface GraphEdge {
  from: string;
  to: string;
  label: string;
}

/**
 * Lightweight interactive relationship graph (pure SVG, no heavy deps).
 * Radial layout: anchor in the center, connected platforms around it.
 */
export function RelationshipGraph({
  profiles,
  repositories,
}: {
  profiles: PublicProfile[];
  repositories: PublicRepository[];
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const { nodes, edges } = useMemo(() => {
    const anchor = profiles.find((p) => p.platform === 'github') ?? profiles[0];
    if (!anchor) return { nodes: [] as GraphNode[], edges: [] as GraphEdge[] };

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const cx = 320;
    const cy = 240;

    nodes.push({ id: 'person', label: anchor.displayName ?? anchor.username ?? 'Person', platform: 'person', x: cx, y: cy });

    const connected = profiles.filter((p) => p !== anchor).slice(0, 7);
    const radius = 160;
    connected.forEach((p, i) => {
      const angle = (2 * Math.PI * i) / Math.max(connected.length, 1) - Math.PI / 2;
      nodes.push({
        id: `platform-${p.platform}`,
        label: PLATFORM_LABELS[p.platform] ?? p.platform,
        platform: p.platform,
        x: cx + radius * Math.cos(angle),
        y: cy + radius * 0.75 * Math.sin(angle),
        url: p.profileUrl,
      });
      edges.push({ from: 'person', to: `platform-${p.platform}`, label: p.confidence !== undefined ? `MATCHED_BY ${p.confidence}%` : 'LINKED_FROM' });
    });

    const topRepos = repositories.slice(0, 4);
    topRepos.forEach((r, i) => {
      const angle = (2 * Math.PI * i) / Math.max(topRepos.length, 1) - Math.PI / 2 + 0.4;
      nodes.push({
        id: `repo-${i}`,
        label: r.name,
        platform: 'repo',
        x: cx + 85 * Math.cos(angle),
        y: cy + 85 * Math.sin(angle),
        url: r.url,
      });
      edges.push({ from: 'person', to: `repo-${i}`, label: 'OWNS_PUBLIC_PROJECT' });
    });

    return { nodes, edges };
  }, [profiles, repositories]);

  if (nodes.length === 0) return null;

  return (
    <div className="dt-card p-4">
      <p className="mb-2 flex items-center gap-2 text-xs dt-muted">
        <GitBranch size={13} aria-hidden />
        Public relationship graph — inferred links only
      </p>
      <svg viewBox="0 0 640 480" className="w-full" role="img" aria-label="Relationship graph of discovered public profiles">
        {edges.map((e, i) => {
          const a = nodes.find((n) => n.id === e.from);
          const b = nodes.find((n) => n.id === e.to);
          if (!a || !b) return null;
          const active = hovered === null || hovered === e.from || hovered === e.to;
          return (
            <g key={i}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={active ? '#6366F1' : 'var(--color-border)'}
                strokeOpacity={active ? 0.5 : 0.25}
                strokeWidth={1.5}
              />
              {hovered && (hovered === e.from || hovered === e.to) && (
                <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 4} textAnchor="middle" fontSize="9" fill="var(--color-text-muted)">
                  {e.label}
                </text>
              )}
            </g>
          );
        })}
        {nodes.map((n, i) => {
          const isCenter = n.platform === 'person';
          const color = isCenter ? '#6366F1' : n.platform === 'repo' ? '#22C55E' : PLATFORM_COLORS[n.platform] ?? '#6b7280';
          const active = hovered === null || hovered === n.id;
          return (
            <motion.g
              key={n.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: active ? 1 : 0.4, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onMouseEnter={() => setHovered(n.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: n.url ? 'pointer' : 'default' }}
              onClick={() => n.url && window.open(n.url, '_blank', 'noopener')}
            >
              <circle cx={n.x} cy={n.y} r={isCenter ? 34 : 22} fill={color} fillOpacity={0.15} stroke={color} strokeWidth={1.5} />
              <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="9" fontWeight={isCenter ? 700 : 500} fill="var(--color-text)">
                {n.label.length > 12 ? `${n.label.slice(0, 11)}…` : n.label}
              </text>
            </motion.g>
          );
        })}
      </svg>
      <p className="dt-muted text-[11px] mt-1">Hover a node to inspect edge evidence. Click an outer node to open the public profile.</p>
    </div>
  );
}
