import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q') || ''
    const docs = await db.document.findMany({
      select: { id: true, title: true, category: true, summary: true, keywords: true, content: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    if (!q) {
      return NextResponse.json({ docs: docs.map((d) => ({ ...d, content: d.content.slice(0, 200) })) })
    }
    const matched = docs
      .map((d) => {
        let score = 0
        const kws = (d.keywords || '').split(',').filter(Boolean)
        kws.forEach((k) => { if (q.includes(k)) score += 5 })
        if (d.title.includes(q)) score += 6
        if (d.content.includes(q)) score += 3
        return { d, score }
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
    return NextResponse.json({
      docs: matched.map((x) => ({
        ...x.d,
        content: x.d.content.slice(0, 300),
        score: x.score,
      })),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
