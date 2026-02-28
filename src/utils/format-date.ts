import { formatDistanceToNowStrict, format, isThisYear } from 'date-fns';

/**
 * Returns a short relative time string like "2h", "3d", "1w"
 */
export function timeAgo(dateString: string): string {
  const distance = formatDistanceToNowStrict(new Date(dateString), { addSuffix: false });

  // Convert "2 hours" -> "2h", "3 days" -> "3d", etc.
  return distance
    .replace(' seconds', 's')
    .replace(' second', 's')
    .replace(' minutes', 'm')
    .replace(' minute', 'm')
    .replace(' hours', 'h')
    .replace(' hour', 'h')
    .replace(' days', 'd')
    .replace(' day', 'd')
    .replace(' weeks', 'w')
    .replace(' week', 'w')
    .replace(' months', 'mo')
    .replace(' month', 'mo')
    .replace(' years', 'y')
    .replace(' year', 'y');
}

/**
 * Returns a formatted date for posts older than a week.
 * Example: "March 15" or "March 15, 2023"
 */
export function formatPostDate(dateString: string): string {
  const date = new Date(dateString);
  if (isThisYear(date)) {
    return format(date, 'MMMM d');
  }
  return format(date, 'MMMM d, yyyy');
}
