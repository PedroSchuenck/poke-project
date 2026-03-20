export function formatName(value) {
    return value
        .split('-')
        .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
        .join(' ')
}