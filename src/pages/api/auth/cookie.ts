import supabase from '@src/modules/supabase'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse){ 
	supabase.auth.api.setAuthCookie(req, res)
}
