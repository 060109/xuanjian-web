import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { extname, resolve } from 'path'
import { pathToFileURL } from 'url'
import mammoth from 'mammoth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const allowedExt = ['.pdf', '.txt', '.md', '.json', '.docx', '.png', '.jpg', '.jpeg', '.webp']

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const title = String(formData.get('title') || '')
    const category = String(formData.get('category') || '其他')

    if (!file) {
      return NextResponse.json({ success: false, error: '未上传文件' }, { status: 400 })
    }

    const filename = file.name || 'document'
    const ext = extname(filename).toLowerCase()
    if (!allowedExt.includes(ext)) {
      return NextResponse.json({ success: false, error: '不支持的文件格式' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    let content = ''

    if (ext === '.pdf') {
      const pdfParse = await import('pdf-parse')
      const { PDFParse } = pdfParse
      if (!PDFParse || typeof PDFParse.setWorker !== 'function') {
        throw new Error('pdf-parse 模块加载失败')
      }
      const workerPath = resolve(process.cwd(), 'node_modules', 'pdf-parse', 'dist', 'pdf-parse', 'cjs', 'pdf.worker.mjs')
      PDFParse.setWorker(pathToFileURL(workerPath).href)
      const parser = new PDFParse({ data: Buffer.from(arrayBuffer) })
      const result = await parser.getText()
      content = result.text || ''
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) })
      content = result.value || ''
    } else if (['.txt', '.md', '.json'].includes(ext)) {
      content = new TextDecoder('utf-8').decode(arrayBuffer)
    } else if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
      content = '【图片内容，暂不支持自动提取文本】'
    }

    if (!content.trim()) {
      return NextResponse.json({ success: false, error: '无法解析文件内容，请检查文件是否有效' }, { status: 400 })
    }

    const keywords = []
    const summary = content.slice(0, 200).replace(/\s+/g, ' ')

    const record = await db.document.create({
      data: {
        title: title || filename,
        fileName: filename,
        fileType: ext.slice(1),
        content,
        summary,
        category,
        keywords: keywords.join(','),
        chunks: JSON.stringify([]),
        size: content.length,
      },
    })

    return NextResponse.json({
      success: true,
      title: record.title,
      chunkCount: 1,
      contentLength: record.size,
    })
  } catch (e: any) {
    console.error('[/api/upload] error:', e)
    return NextResponse.json({ success: false, error: e.message || '上传解析失败' }, { status: 500 })
  }
}
