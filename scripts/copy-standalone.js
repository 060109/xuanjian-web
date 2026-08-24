import { cpSync, mkdirSync } from 'fs'
import { resolve } from 'path'

const root = resolve('.')
const srcStatic = resolve(root, '.next', 'static')
const destStatic = resolve(root, '.next', 'standalone', '.next')
const destPublic = resolve(root, '.next', 'standalone', 'public')

mkdirSync(destStatic, { recursive: true })
mkdirSync(destPublic, { recursive: true })
cpSync(srcStatic, destStatic, { recursive: true })
cpSync(resolve(root, 'public'), destPublic, { recursive: true })
