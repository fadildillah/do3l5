const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://iziyskcgzcxxssesnewo.supabase.co', 'sb_publishable_xdxfH-IiodiocjlAS_vk3Q_e64XOMbS');

async function test() {
  const { data, error } = await supabase.from('photos').select('*').eq('id', '90375639-44e0-486f-b9f0-8d5172dd5c2c');
  console.log('Does the deleted photo ID exist in the DB?', data && data.length > 0 ? 'YES' : 'NO');
  if (data && data.length > 0) {
    console.log('It is frame number:', data[0].frame_number);
  }
}
test();
