import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'

const AuthContext = createContext({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
  uploadAvatar: async () => {},
  refreshProfile: async () => {},
})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Profile not created by trigger yet, wait and retry once
          await new Promise((resolve) => setTimeout(resolve, 1000))
          const { data: retryData, error: retryError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
          
          if (retryError) throw retryError
          setProfile(retryData)
        } else {
          throw error
        }
      } else {
        setProfile(data)
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setProfile(null)
    }
  }

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        setLoading(true)
        await fetchProfile(session.user.id)
        setLoading(false)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        }
      }
    })
    if (error) throw error
    return data
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setSession(null)
    setProfile(null)
  }

  const updateProfile = async (updates) => {
    if (!user) throw new Error('User not logged in')
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    setProfile(data)
    return data
  }

  const uploadAvatar = async (file) => {
    if (!user) throw new Error('User not logged in')
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    uploadAvatar,
    refreshProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
