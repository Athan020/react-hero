// dateHelpers.ts
// Practical date-fns utilities for React applications
// Demonstrates: formatting, relative time, parsing, locale support, custom hooks

import {
    format,
    parseISO,
    formatDistanceToNow,
    differenceInDays,
    differenceInHours,
    differenceInMinutes,
    isAfter,
    isBefore,
    isToday,
    isYesterday,
    isTomorrow,
    addDays,
    startOfDay,
    endOfDay,
    isWithinInterval,
    isValid,
} from 'date-fns';

// ============================================
// 1. Smart Date Formatting
// ============================================

/**
 * Formats a date intelligently based on how recent it is:
 * - Today: "10:25 AM"
 * - Yesterday: "Yesterday at 3:00 PM"
 * - This week: "Monday at 2:30 PM"
 * - Older: "Feb 10, 2026"
 */
export function smartFormat(dateInput: Date | string): string {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;

    if (!isValid(date)) return 'Invalid date';

    if (isToday(date)) {
        return `Today at ${format(date, 'h:mm a')}`;
    }

    if (isYesterday(date)) {
        return `Yesterday at ${format(date, 'h:mm a')}`;
    }

    if (isTomorrow(date)) {
        return `Tomorrow at ${format(date, 'h:mm a')}`;
    }

    const daysDiff = Math.abs(differenceInDays(new Date(), date));

    if (daysDiff < 7) {
        return format(date, "EEEE 'at' h:mm a"); // "Monday at 2:30 PM"
    }

    if (date.getFullYear() === new Date().getFullYear()) {
        return format(date, 'MMM d'); // "Feb 10"
    }

    return format(date, 'MMM d, yyyy'); // "Feb 10, 2026"
}

// ============================================
// 2. Relative Time with Granularity
// ============================================

/**
 * Returns a human-readable relative time string:
 * - "just now" (< 1 minute)
 * - "5 minutes ago"
 * - "2 hours ago"
 * - "3 days ago"
 * - Falls back to date format for > 30 days
 */
export function relativeTime(dateInput: Date | string): string {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    const now = new Date();

    if (!isValid(date)) return 'Invalid date';

    const minutes = differenceInMinutes(now, date);
    const hours = differenceInHours(now, date);
    const days = differenceInDays(now, date);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;

    return format(date, 'MMM d, yyyy');
}

// ============================================
// 3. Deadline & Duration Utilities
// ============================================

export interface DeadlineInfo {
    isPast: boolean;
    isToday: boolean;
    isSoon: boolean; // Within 3 days
    label: string;
    daysRemaining: number;
    urgency: 'overdue' | 'urgent' | 'soon' | 'normal';
}

/**
 * Get comprehensive deadline information for a due date
 */
export function getDeadlineInfo(deadlineInput: Date | string): DeadlineInfo {
    const deadline = typeof deadlineInput === 'string' ? parseISO(deadlineInput) : deadlineInput;
    const now = new Date();

    const daysRemaining = differenceInDays(deadline, now);
    const isPast = isAfter(now, endOfDay(deadline));
    const deadlineIsToday = isToday(deadline);
    const isSoon = daysRemaining <= 3 && daysRemaining >= 0;

    let urgency: DeadlineInfo['urgency'];
    if (isPast) urgency = 'overdue';
    else if (deadlineIsToday) urgency = 'urgent';
    else if (isSoon) urgency = 'soon';
    else urgency = 'normal';

    const label = isPast
        ? `Overdue by ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? 's' : ''}`
        : deadlineIsToday
            ? 'Due today'
            : `Due ${formatDistanceToNow(deadline, { addSuffix: true })}`;

    return {
        isPast,
        isToday: deadlineIsToday,
        isSoon,
        label,
        daysRemaining,
        urgency,
    };
}

/**
 * Urgency color mapping for UI
 */
export function getUrgencyColor(urgency: DeadlineInfo['urgency']): string {
    const colors = {
        overdue: '#ef4444',  // red
        urgent: '#f97316',   // orange
        soon: '#eab308',     // yellow
        normal: '#22c55e',   // green
    };
    return colors[urgency];
}

// ============================================
// 4. Date Range Utilities
// ============================================

/**
 * Check if a date falls within a range
 */
export function isInRange(
    date: Date | string,
    start: Date | string,
    end: Date | string
): boolean {
    const d = typeof date === 'string' ? parseISO(date) : date;
    const s = typeof start === 'string' ? parseISO(start) : start;
    const e = typeof end === 'string' ? parseISO(end) : end;

    return isWithinInterval(d, { start: startOfDay(s), end: endOfDay(e) });
}

/**
 * Generate an array of dates for a date range (useful for calendars)
 */
export function getDateRange(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    let current = startOfDay(start);
    const endDate = startOfDay(end);

    while (!isAfter(current, endDate)) {
        dates.push(current);
        current = addDays(current, 1);
    }

    return dates;
}

// ============================================
// 5. Formatting Presets
// ============================================

/**
 * Common format presets for consistency across the app
 */
export const dateFormats = {
    /** Feb 10, 2026 */
    display: (date: Date | string) =>
        format(typeof date === 'string' ? parseISO(date) : date, 'MMM d, yyyy'),

    /** 2026-02-10 */
    iso: (date: Date | string) =>
        format(typeof date === 'string' ? parseISO(date) : date, 'yyyy-MM-dd'),

    /** February 10, 2026 */
    full: (date: Date | string) =>
        format(typeof date === 'string' ? parseISO(date) : date, 'MMMM d, yyyy'),

    /** 10:25 AM */
    time: (date: Date | string) =>
        format(typeof date === 'string' ? parseISO(date) : date, 'h:mm a'),

    /** Feb 10, 2026 at 10:25 AM */
    dateTime: (date: Date | string) =>
        format(typeof date === 'string' ? parseISO(date) : date, "MMM d, yyyy 'at' h:mm a"),

    /** Tuesday, February 10th, 2026 */
    dayFull: (date: Date | string) =>
        format(typeof date === 'string' ? parseISO(date) : date, 'EEEE, MMMM do, yyyy'),
} as const;

// Usage:
// dateFormats.display('2026-02-10')  → "Feb 10, 2026"
// dateFormats.time(new Date())       → "10:25 AM"
// dateFormats.dateTime(post.createdAt) → "Feb 10, 2026 at 10:25 AM"
