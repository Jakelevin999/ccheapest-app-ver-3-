import { supabase } from './supabase'

export async function getProfile(userId:string) {
  return await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
}

export async function updateProfile(userId:string, updates:any) {
  return await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
}
