import { createClient } from '@supabase/supabase-js';

// URL này đã khớp với dự án "công việc ngói xanh" của bạn
const supabaseUrl = 'https://brjjyvmnpkccgtoahwbp.supabase.co'; 

// Đây là mã Key anon public bạn vừa cung cấp
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyamp5dm1ucGtjY2d0b2Fod2JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MzI2NzMsImV4cCI6MjA4MzQwODY3M30.U8l8T1Zy0kuUoA5PHeQrz_8EW-M11c5rBwep88XiigE';

export const supabase = createClient(supabaseUrl, supabaseKey);