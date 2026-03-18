const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://iziyskcgzcxxssesnewo.supabase.co', 'sb_publishable_xdxfH-IiodiocjlAS_vk3Q_e64XOMbS');

async function test() {
  const { data, error } = await supabase.from('photos').select('*').eq('roll_id', '3bc3c77d-3ca2-4b8a-b305-b9b874b28d6c');
  console.log('Photos in roll count:', data ? data.length : 0);
  console.log('Frames:', data ? data.map(p => p.frame_number).join(', ') : 'none');
}
test();
