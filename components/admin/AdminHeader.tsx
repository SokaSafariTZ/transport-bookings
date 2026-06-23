export function AdminHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex items-center justify-between border-b border-line px-6 py-5">
      <div>
        <h1 className="text-xl font-bold text-title">{title}</h1>
        {subtitle && <p className="text-sm text-subtitle">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
