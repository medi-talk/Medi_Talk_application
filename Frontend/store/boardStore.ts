// store/boardStore.ts
import { create } from "zustand";

// 답변 데이터 구조
export interface Answer {
  id: string;
  postId: string;
  authorName: string;
  authorType: "의사" | "약사";
  hospital: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

// 게시글 데이터 구조
export interface Post {
  id: string;
  category: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
  answers: Answer[];
}

// Zustand 상태 정의
interface BoardState {
  posts: Post[];

  // 게시글 관련 함수
  fetchPosts: () => Promise<void>;
  addPost: (p: Omit<Post, "id" | "createdAt" | "answers">) => Promise<void>;
  updatePost: (id: string, data: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;

  // 답변 관련 함수
  addAnswer: (postId: string, a: Omit<Answer, "id" | "createdAt">) => Promise<void>;
  updateAnswer: (postId: string, answerId: string, data: Partial<Answer>) => Promise<void>;
  deleteAnswer: (postId: string, answerId: string) => Promise<void>;
}

export const useBoardStore = create<BoardState>((set, _get) => ({
  posts: [],

  // DB 연동 시 axios.get("/api/posts")로 교체
  async fetchPosts() {
    console.log("게시글 목록 가져오기 (현재는 로컬 상태)");
  },

  // DB 연동 시 axios.post("/api/posts", p)로 교체
  async addPost(p) {
    set((state) => ({
      posts: [
        ...state.posts,
        {
          ...p,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          answers: [],
        },
      ],
    }));
  },

  // DB 연동 시 axios.put(`/api/posts/${id}`, data)로 교체
  async updatePost(id, data) {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
      ),
    }));
  },

  // DB 연동 시 axios.delete(`/api/posts/${id}`)로 교체
  async deletePost(id) {
    set((state) => ({
      posts: state.posts.filter((p) => p.id !== id),
    }));
  },

  // DB 연동 시 axios.post(`/api/posts/${postId}/answers`, a)로 교체
  async addAnswer(postId, a) {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              answers: [
                ...p.answers,
                {
                  ...a,
                  id: Date.now().toString(),
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : p
      ),
    }));
  },

  // DB 연동 시 axios.put(`/api/posts/${postId}/answers/${answerId}`, data)로 교체
  async updateAnswer(postId, answerId, data) {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              answers: p.answers.map((a) =>
                a.id === answerId
                  ? { ...a, ...data, updatedAt: new Date().toISOString() }
                  : a
              ),
            }
          : p
      ),
    }));
  },

  // DB 연동 시 axios.delete(`/api/posts/${postId}/answers/${answerId}`)로 교체
  async deleteAnswer(postId, answerId) {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? { ...p, answers: p.answers.filter((a) => a.id !== answerId) }
          : p
      ),
    }));
  },
}));
