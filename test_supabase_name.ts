import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cvycrgkzzcwukzknhspd.supabase.co'
const supabaseKey = 'sb_publishable_T7mJEYsEitEKYW9usc8h9g_KsqaM7mp'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testInsert() {
  const { data, error } = await supabase
    .from('products')
    .insert([{
      category: 'ebook',
      name: 'test',
      price: '1000',
      description: 'test desc',
      image_url: ''
    }])
    .select()

  if (error) {
    console.error('Insert error:', error)
  } else {
    console.log('Insert success:', data)
  }
}

testInsert()
