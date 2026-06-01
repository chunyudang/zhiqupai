import request from './request'
import type {
  ApiResponse,
  PaginatedData,
  Question,
  CreateQuestionParams,
  UpdateQuestionParams,
  QueryQuestionsParams,
} from '@/types'

export async function getQuestions(params: QueryQuestionsParams = {}): Promise<PaginatedData<Question>> {
  const res = await request.get<unknown, ApiResponse<PaginatedData<Question>>>('/questions', { params })
  return res.data!
}

export async function createQuestion(data: CreateQuestionParams): Promise<Question> {
  const res = await request.post<unknown, ApiResponse<Question>>('/questions', data)
  return res.data!
}

export async function updateQuestion(id: number, data: UpdateQuestionParams): Promise<Question> {
  const res = await request.put<unknown, ApiResponse<Question>>(`/questions/${id}`, data)
  return res.data!
}

export async function deleteQuestion(id: number): Promise<void> {
  await request.delete(`/questions/${id}`)
}
