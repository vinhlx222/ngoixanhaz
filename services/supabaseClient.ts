
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://brjjyvmnpkccgtoahwbp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_qQfI5aL2HfgxbDtCPsiDaw_MAkLYCNZ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
