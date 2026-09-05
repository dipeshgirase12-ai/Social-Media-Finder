/** Landing-page strip summarizing what each provider offers. */
export function PlatformStatusStrip() {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-5 pb-8 sm:grid-cols-4" aria-label="Platform availability">
      {(
        [
          ['GitHub', 'Official API', true],
          ['GitLab', 'Official API', true],
          ['npm', 'Public registry', true],
          ['Website', 'Metadata analysis', true],
          ['LinkedIn', 'External search', false],
          ['Instagram', 'External search', false],
          ['X', 'External search', false],
          ['Medium', 'External search', false],
        ] as const
      ).map(([name, mode, direct]) => (
        <div key={name} className="flex items-center gap-3 px-1 py-2">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${direct ? 'bg-accent-500' : 'bg-amber-400'}`}
            aria-hidden
          />
          <div className="min-w-0 space-y-1">
            <p className="truncate text-xs font-medium">{name}</p>
            <p className="dt-muted truncate text-[11px]">{mode}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
