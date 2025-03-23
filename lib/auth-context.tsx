"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { User, LoginCredentials, AuthState } from "@/types/auth"

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Define role permissions
const rolePermissions: Record<string, string[]> = {
  admin: ["*"],
  manager: [
    "view:employees",
    "view:attendance",
    "view:payroll",
    "view:delivery",
    "view:audit",
    "view:billing",
    "view:balance",
    "edit:employees",
    "edit:attendance",
    "edit:delivery",
    "edit:audit",
  ],
  employee: [
    "view:attendance",
    "view:delivery",
    "view:audit",
  ],
  cashier: [
    "view:attendance",
    "view:delivery",
    "view:audit",
    "edit:delivery",
  ],
  waiter: [
    "view:attendance",
    "view:delivery",
    "view:audit",
    "edit:delivery",
  ],
  kitchen: [
    "view:attendance",
    "view:delivery",
    "view:audit",
    "edit:delivery",
  ],
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    validateSession()

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserData(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        router.push('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase.auth])

  const fetchUserData = async (userId: string) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

      if (userError) throw userError
      setUser(userData)
    } catch (error) {
      console.error("Error fetching user data:", error)
      setError("Error al obtener datos del usuario")
    }
  }

  const validateSession = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) throw sessionError
      
      if (session?.user) {
        await fetchUserData(session.user.id)
      }
    } catch (error) {
      console.error("Session validation error:", error)
      setError("Error al validar la sesión")
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: { user: authUser }, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (authError) throw authError

      await fetchUserData(authUser?.id!)
      router.push("/")
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Error al iniciar sesión")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      setError("Error al cerrar sesión")
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    const permissions = rolePermissions[user.role] || []
    return permissions.includes("*") || permissions.includes(permission)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

