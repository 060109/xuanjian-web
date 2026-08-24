import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get('type')
    if (type === 'chat') {
      const msgs = await db.chatMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })
      return NextResponse.json({ chats: msgs })
    }
    if (type === 'calc') {
      const calcs = await db.calculation.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })
      return NextResponse.json({ calcs })
    }
    const [calcs, chats] = await Promise.all([
      db.calculation.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
      db.chatMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    ])
    return NextResponse.json({ calcs, chats })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { type, title, input, result, note } = await req.json()
    if (!type || !title) {
      return NextResponse.json({ error: 'type 与 title 必填' }, { status: 400 })
    }
    const calc = await db.calculation.create({
      data: {
        type,
        title,
        input: JSON.stringify(input || {}),
        result: JSON.stringify(result || {}),
        note: note || null,
      },
    })
    return NextResponse.json({ success: true, id: calc.id })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const scope = req.nextUrl.searchParams.get('scope')
    if (scope === 'calc') {
      await db.calculation.deleteMany({})
    } else if (scope === 'chat') {
      await db.chatMessage.deleteMany({})
    } else {
      await db.calculation.deleteMany({})
      await db.chatMessage.deleteMany({})
    }
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
