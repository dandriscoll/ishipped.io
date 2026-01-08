interface TagListProps {
  tags: string[];
}

export function TagList({ tags }: TagListProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="px-3 py-1 text-sm bg-blue-50 dark:bg-blue-900/30 text-accent dark:text-blue-300 rounded-full"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
