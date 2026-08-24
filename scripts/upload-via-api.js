// 玄鉴 AI · 通过 GitHub Git Data API 上传本地仓库（绕过 github.com 直连，仅用 api.github.com）
// 用法: node scripts/upload-via-api.js <owner/repo> <token> <branch>
// 安全: token 仅从命令行参数读取，不写入文件/日志
import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const [owner, repo] = process.argv[2].split('/')
const TOKEN = process.argv[3]
const BRANCH = process.argv[4] || 'main'
const API = `https://api.github.com/repos/${owner}/${repo}`

async function api(method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: {
      Authorization: `token ${TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'xuanjian-upload',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(data).slice(0, 200)}`)
  return data
}

function git(...args) {
  return execSync(`git ${args.join(' ')}`, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 64 }).trim()
}

async function main() {
  // 1. 读取本地 HEAD
  const head = git('rev-parse', 'HEAD')
  console.log('本地 HEAD:', head)
  const message = git('log', '-1', '--format=%B', 'HEAD').split('\n').filter(Boolean)[0] || 'deploy via API'

  // 1.5 空仓库初始化：先用 Contents API 创建 README 解锁（git data API 对空仓库返回 409）
  let parentSha = null
  try {
    await api('GET', `/git/ref/heads/${BRANCH}`)
  } catch {
    console.log('仓库为空，用 Contents API 创建初始 README 解锁…')
    const initRes = await fetch(API + '/contents/README.md', {
      method: 'PUT',
      headers: {
        Authorization: `token ${TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'xuanjian-upload',
      },
      body: JSON.stringify({
        message: 'chore: init',
        content: Buffer.from('# xuanjian-web\n\n玄鉴 AI · 东方术数研究空间\n').toString('base64'),
      }),
    })
    if (!initRes.ok) throw new Error(`Contents 初始化失败: ${initRes.status}`)
    const initData = await initRes.json()
    parentSha = initData.commit?.sha || null
    console.log('✅ 初始 README 已创建:', parentSha)
  }

  // 2. 列出所有文件（git ls-tree -r）
  const entries = git('ls-tree', '-r', 'HEAD').split('\n').filter(Boolean).map((line) => {
    const [, type, sha, name] = line.split(/\s+/, 4)
    return { type, sha, name: name.replace(/^"|"$/g, '').replace(/\\"/g, '"').replace(/\\\\/g, '\\') }
  })
  const files = entries.filter((e) => e.type === 'blob')
  console.log(`共 ${files.length} 个文件待上传`)

  // 3. 上传所有 blob（按 sha 去重）
  const shaMap = new Map()
  for (let i = 0; i < files.length; i++) {
    const f = files[i]
    if (shaMap.has(f.sha)) continue
    const content = execSync(`git cat-file blob ${f.sha}`, { maxBuffer: 1024 * 1024 * 64 })
    const { sha } = await api('POST', '/git/blobs', { content: content.toString('base64'), encoding: 'base64' })
    shaMap.set(f.sha, sha)
    if (i % 25 === 0) console.log(`  blob ${i + 1}/${files.length}`)
  }
  console.log('✅ 所有 blob 已上传')

  // 4. 构建目录树（基于路径分组，修复 git ls-tree -r 不输出 tree 条目导致目录丢失的问题）
  const pathMap = new Map(files.map((f) => [f.name, f.sha]))
  async function buildTreeFor(prefix) {
    const items = []
    const subDirs = new Set()
    for (const [path, sha] of pathMap) {
      if (prefix && !path.startsWith(prefix + '/')) continue
      const rest = prefix ? path.slice(prefix.length + 1) : path
      if (!rest) continue
      const parts = rest.split('/')
      if (parts.length === 1) {
        items.push({ path: parts[0], mode: '100644', type: 'blob', sha: shaMap.get(sha) })
      } else {
        subDirs.add(parts[0])
      }
    }
    for (const dir of subDirs) {
      const sub = await buildTreeFor(prefix ? `${prefix}/${dir}` : dir)
      items.push({ path: dir, mode: '040000', type: 'tree', sha: sub })
    }
    return prefix ? (await api('POST', '/git/trees', { tree: items })).sha : items
  }
  const rootItems = await buildTreeFor('')
  const { sha: treeSha } = await api('POST', '/git/trees', { tree: rootItems })
  console.log('✅ 目录树已构建:', treeSha)

  // 5. 创建 commit
  const { sha: commitSha } = await api('POST', '/git/commits', {
    message,
    tree: treeSha,
    parents: parentSha ? [parentSha] : [],
    author: { name: 'xuanjian-deploy', email: 'deploy@xuanjian.local' },
    committer: { name: 'xuanjian-deploy', email: 'deploy@xuanjian.local' },
  })
  console.log('✅ commit 已创建:', commitSha)

  // 6. 更新分支 ref（force 以覆盖初始 commit）
  await api('PATCH', `/git/refs/heads/${BRANCH}`, { sha: commitSha, force: true })
  console.log(`✅ 分支 ${BRANCH} 已更新为 ${commitSha}`)
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})
