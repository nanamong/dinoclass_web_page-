import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cvycrgkzzcwukzknhspd.supabase.co'
const supabaseKey = 'sb_publishable_T7mJEYsEitEKYW9usc8h9g_KsqaM7mp'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testSelect() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(1)

  console.log('Select:', data, error)
}

testSelect()
