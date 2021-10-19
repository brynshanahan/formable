const CHARS = '!@#$%^&*()_+0123456789abcdefghijklmnopqrstuvwxyz'
export function uuid (len =8) {
  let id = ""
  for (let i = 0; i < len; i++) {
    id += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return id
}