export const timeValidator = (start: number | null, end: number | null) => {
    if (start !== null && isNaN(start)) {
        return 'Invalid start date';
    };
    if (end !== null && isNaN(end)) {
        return 'Invalid end date';
    };
    if (start && end && start > end) {
        return 'End date must be after start date';
    };
    return false;
};