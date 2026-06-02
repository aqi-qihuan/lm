import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/user'
import { login as apiLogin, logout as apiLogout, getUserProfile } from '@/services/userService'

interface UserState {
  user: User | null
  token: string | null
  isLogin: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => boolean
  fetchProfile: () => Promise<void>
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLogin: false,

      /** 登录 - Token 从响应头 x-jwt-token 获取 */
      login: async (email: string, password: string) => {
        await apiLogin(email, password)
        // Token 在 axios 拦截器中已处理（从响应头提取）
        const token = localStorage.getItem('token')
        if (token) {
          set({ token, isLogin: true })
        }
      },

      /** 退出登录 */
      logout: () => {
        apiLogout().catch(() => {}) // 调用后端退出
        localStorage.removeItem('token')
        set({ user: null, token: null, isLogin: false })
      },

      /** 检查本地 Token */
      checkAuth: () => {
        const token = localStorage.getItem('token')
        if (token) {
          set({ token, isLogin: true })
          return true
        }
        return false
      },

      /** 获取用户信息 */
      fetchProfile: async () => {
        try {
          const user = await getUserProfile()
          set({ user })
        } catch {
          // Token 过期等情况
          get().logout()
        }
      },

      setUser: (user: User | null) => set({ user }),
      setToken: (token: string | null) => set({ token, isLogin: !!token }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isLogin: state.isLogin }),
    }
  )
)
