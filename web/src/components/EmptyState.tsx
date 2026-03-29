import { Link } from "react-router";

interface Props {
  icon?: string;
  emoji?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionLink?: string;
  actionTo?: string;
}

export default function EmptyState({
  icon,
  emoji = "📭",
  title,
  description,
  actionLabel,
  actionLink,
  actionTo,
}: Props) {
  const displayEmoji = icon || emoji;
  const linkTo = actionLink || actionTo;
  return (
    <div className="rounded-2xl border-2 border-dashed border-zinc-700 py-16 text-center">
      <p className="text-5xl">{displayEmoji}</p>
      <p className="mt-3 text-lg font-semibold text-zinc-200">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      )}
      {actionLabel && linkTo && (
        <Link
          to={linkTo}
          className="mt-4 inline-block rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
