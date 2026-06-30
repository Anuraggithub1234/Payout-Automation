export function randomText(prefix: string, length = 5): string {
  return `${prefix}${Math.random().toString(36).slice(2, 2 + length).toUpperCase()}`;
}

export function randomNumber(digits: number): string {
  const min = 10 ** (digits - 1);
  const max = 9 * min;

  return Math.floor(Math.random() * max + min).toString();
}

export function randomEmail(prefix = 'auto'): string {
  return `${randomText(prefix).toLowerCase()}@gmail.com`;
}

