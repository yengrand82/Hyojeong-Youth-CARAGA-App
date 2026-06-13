import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ccvfkuuwlvlqjiofbnke.supabase.co'
const supabaseKey = 'sb_publishable_p61V4ffWrrya6luDgpc53w_PdzamlGs'

export const supabase = createClient(supabaseUrl, supabaseKey)
