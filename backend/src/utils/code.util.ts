import { randomInt } from 'crypto'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateJoinCode(length = 6) {
    let code = ''
    for (let i = 0; i < length; i++) {
        code += CHARS[randomInt(CHARS.length)]
    }
    return code
}