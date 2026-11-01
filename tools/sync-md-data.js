import { promises as fs } from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import matter from 'gray-matter'
const CONCURRENCY_LIMIT = 5
const ROOT = process.cwd()
function runGit(args, cwd = ROOT) {
  return new Promise((resolve, reject) => {
    const proc = spawn('git', args, { cwd, stdio: 'pipe' })
    let stderr = ''
    proc.stderr.on('data', d => { stderr += d.toString() })
    proc.on('close', code => {
      if (code === 0) resolve()
      else reject(new Error(stderr.trim() || `git exited with ${code}`))
    })
  })
}
async function findVolunteerFiles() {
  const results = []
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (['node_modules', '.git', '.vitepress', 'dist', '.cache'].includes(entry.name)) continue
        await walk(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const rel = path.relative(ROOT, fullPath)
        if (/humans[\\/]volunteers[\\/]/.test(rel)) {
          results.push(rel)
        }
      }
    }
  }
  await walk(ROOT)
  return results
}
async function parseVolunteer(filePath) {
  const content = await fs.readFile(path.join(ROOT, filePath), 'utf-8')
  const { data } = matter(content)
  const normalized = filePath.replace(/\\/g, '/')
  const lang = normalized.split('/')[0] || 'ru'
  let repoUrl = data.repositories
  if (Array.isArray(repoUrl)) {
    repoUrl = repoUrl[0] || null
  }
  return {
    uuid: data.uuid || null,
    repoUrl: repoUrl || null,
    lang
  }
}
async function cloneOrUpdate(repoUrl, absTarget, label) {
  if (!repoUrl) return
  const isGit = await fs.access(path.join(absTarget, '.git'))
    .then(() => true)
    .catch(() => false)
  if (isGit) {
    console.log(`  🔄 Обновление ${label}: ${path.relative(ROOT, absTarget)}`)
    try {
      await runGit(['-C', absTarget, 'pull', '--ff-only'])
    } catch {
      console.warn(`  ⚠️ Сброс изменений в ${label}`)
      await runGit(['-C', absTarget, 'fetch', '--all']).catch(() => {})
      await runGit(['-C', absTarget, 'reset', '--hard', 'origin/main'])
        .catch(() => runGit(['-C', absTarget, 'reset', '--hard', 'origin/master']))
    }
  } else {
    await fs.rm(absTarget, { recursive: true, force: true })
    await fs.mkdir(absTarget, { recursive: true })
    console.log(`  📥 Клонирование ${label}: ${repoUrl}`)
    for (let i = 1; i <= 3; i++) {
      try {
        await runGit(['clone', '--depth', '1', repoUrl, absTarget])
        break
      } catch (err) {
        if (i === 3) throw err
        console.warn(`  ⚠️ Попытка ${i}/3 не удалась, повтор...`)
        await new Promise(r => setTimeout(r, 1000 * i))
      }
    }
    await fs.rm(path.join(absTarget, '.git'), { recursive: true, force: true })
    await fs.rm(path.join(absTarget, '.gitignore'), { force: true }).catch(() => {})
    console.log(`  🧹 Очищено: .git, .gitignore`)
  }
}
async function processFile(filePath) {
  const { uuid, repoUrl, lang } = await parseVolunteer(filePath)
  if (!uuid) {
    console.warn(`  ⚠️ UUID не найден в ${filePath}, пропускаем`)
    return
  }
  if (!repoUrl) {
    console.warn(`  ⚠️ Ссылка на репозиторий не найдена для ${uuid}, пропускаем`)
    return
  }
  console.log(`\n👤 Волонтёр: ${uuid} (${lang})`)
  console.log(`📄 Файл: ${filePath}`)
  const absTarget = path.join(ROOT, lang, 'pets', uuid)
  await fs.mkdir(absTarget, { recursive: true })
  await cloneOrUpdate(repoUrl, absTarget, `volunteer-${uuid}-${lang}`)
}
async function main() {
  console.log('🚀 Синхронизация данных волонтёров...\n')
  const files = await findVolunteerFiles()
  console.log(`📁 Найдено ${files.length} файлов волонтёров\n`)
  for (let i = 0; i < files.length; i += CONCURRENCY_LIMIT) {
    const chunk = files.slice(i, i + CONCURRENCY_LIMIT)
    await Promise.all(chunk.map(processFile))
  }
  console.log('\n✅ Синхронизация завершена!')
}
main().catch(err => {
  console.error('❌ Критическая ошибка:', err)
  process.exit(1)
})