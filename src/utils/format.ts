export function capitalizeName(name: string): string {
  return name
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function formatDate(input: string): string {
  return input; // placeholder
}

export function formatTime(input: string): string {
  return input; // placeholder
}
