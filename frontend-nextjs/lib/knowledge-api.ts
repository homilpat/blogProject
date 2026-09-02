export const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export type Category = {
  id: number;
  code: string;
  name: string;
  section: string;
  description?: string;
  displayOrder: number;
};

export const FALLBACK_CATEGORIES: Category[] = [
  { id: 1, code: 'semi_process', name: '공정 기술', section: 'PROCESS', displayOrder: 1 },
  { id: 2, code: 'semi_equipment', name: '장비/설비', section: 'EQUIPMENT', displayOrder: 2 },
  { id: 3, code: 'semi_troubleshoot', name: '알람 & 트러블슈팅', section: 'TROUBLESHOOT', displayOrder: 3 },
  { id: 4, code: 'semi_yield_metro', name: '수율 & 계측', section: 'YIELD_METRO', displayOrder: 4 },
  { id: 5, code: 'ai_rag_tech', name: 'AI & RAG 엔지니어링', section: 'AI_TECH', displayOrder: 5 },
  { id: 6, code: 'project_log', name: '오늘의 학습 내용', section: 'PROJECT_LOG', displayOrder: 6 },
];

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${API_URL}/api/categories`);
  if (!response.ok) throw new Error('카테고리를 불러오지 못했습니다.');
  return response.json();
}
