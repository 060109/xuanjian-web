'use client'

import { create } from 'zustand'

export type XJView =
  | 'home'
  | 'bazi'
  | 'liuyao'
  | 'qimen'
  | 'tarot'
  | 'name'
  | 'library'
  | 'ai'
  | 'history'
  | 'settings'

/** 模块 id → 路由路径（SPA 视图切换已迁移为真实路由） */
export const MODULE_ROUTES: Record<XJView, string> = {
  home: '/',
  bazi: '/bazi',
  liuyao: '/liuyao',
  qimen: '/qimen',
  tarot: '/tarot',
  name: '/name',
  library: '/library',
  ai: '/ai',
  history: '/history',
  settings: '/settings',
}

interface XJState {
  // 首页卡片的 hover 聚焦 id
  focusedCard: string | null
  setFocusedCard: (id: string | null) => void
}

export const useXJStore = create<XJState>((set) => ({
  focusedCard: null,
  setFocusedCard: (id) => set({ focusedCard: id }),
}))

// 八大功能元信息（顺序对应布局：顶部→右上→右→右下→底部→左下→左→左上）
export interface XJModule {
  id: XJView
  title: string
  subtitle: string
  desc: string
  icon: string // 用于渲染的卦象/符号
  trigram: string // 关联八卦
  accent: string
}

export const XJ_MODULES: XJModule[] = [
  {
    id: 'bazi',
    title: '八字命理',
    subtitle: 'Si Zhu Ming Li',
    desc: '四柱排盘 · 五行分析 · 大运流年',
    icon: '乾',
    trigram: '乾',
    accent: '#c9a96a',
  },
  {
    id: 'qimen',
    title: '奇门遁甲',
    subtitle: 'Qi Men Dun Jia',
    desc: '九宫布局 · 天地人神',
    icon: '星',
    trigram: '巽',
    accent: '#9b7ec9',
  },
  {
    id: 'liuyao',
    title: '六爻梅花',
    subtitle: 'Liu Yao Mei Hua',
    desc: '起卦 · 断卦 · 象数推演',
    icon: '坎',
    trigram: '坎',
    accent: '#5a9b9b',
  },
  {
    id: 'history',
    title: '历史档案',
    subtitle: 'Archive',
    desc: '计算记录 · 学习档案',
    icon: '坤',
    trigram: '坤',
    accent: '#9a8d72',
  },
  {
    id: 'ai',
    title: '天机AI',
    subtitle: 'Tian Ji AI',
    desc: '智能推演 · 综合分析',
    icon: '震',
    trigram: '震',
    accent: '#c9a96a',
  },
  {
    id: 'library',
    title: '典籍库',
    subtitle: 'Classics Library',
    desc: '上传典籍 · 知识索引',
    icon: '艮',
    trigram: '艮',
    accent: '#8aa86b',
  },
  {
    id: 'tarot',
    title: '塔罗占卜',
    subtitle: 'Tarot Divination',
    desc: '牌阵 · 潜意识分析',
    icon: '月',
    trigram: '坤',
    accent: '#c98a8a',
  },
  {
    id: 'name',
    title: '姓名数理',
    subtitle: 'Name Numerology',
    desc: '五格三才 · 五行关系',
    icon: '离',
    trigram: '离',
    accent: '#d9c08a',
  },
]
