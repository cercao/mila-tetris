const STORAGE_KEY = 'tetris_mila_mode'

export function getMilaMode(): boolean {
  return localStorage.getItem(STORAGE_KEY) === '1'
}

export function setMilaMode(value: boolean): void {
  localStorage.setItem(STORAGE_KEY, value ? '1' : '0')
}
