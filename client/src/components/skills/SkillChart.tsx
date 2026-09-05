import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SkillDatum {
  skill: string;
  weight: number;
  count: number;
}

/** Skills chart — clearly presented as "detected from public project activity". */
export function SkillChart({ skills }: { skills: SkillDatum[] }) {
  if (skills.length === 0) {
    return <p className="dt-muted text-sm">No public technical evidence detected.</p>;
  }

  return (
    <div>
      <p className="dt-muted text-xs mb-3">Detected from public project activity — not certified expertise.</p>
      <div style={{ width: '100%', height: Math.max(160, skills.length * 34) }} role="img" aria-label="Skill chart from public repositories">
        <ResponsiveContainer>
          <BarChart data={skills} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="skill"
              width={110}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(99,102,241,0.08)' }}
              contentStyle={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                fontSize: 12,
                color: 'var(--color-text)',
              }}
              formatter={(value: number) => [`${value} evidence`, 'Weight']}
            />
            <Bar dataKey="weight" radius={[0, 4, 4, 0]} barSize={14}>
              {skills.map((s, i) => (
                <Cell key={s.skill} fill={i < 3 ? '#6366F1' : '#818CF8'} fillOpacity={1 - i * 0.06} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
