const SUPABASE_URL = 'https://yarrynilnisfvjctuswl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_2X5M7UnsM929CZjGSdLNtQ_-Y2a74lX';
const BUCKET_NAME = 'site-images';
const TABLE_NAME = 'site_content';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function showMessage(element, text, type = 'info') {
  if (!element) return;
  element.textContent = text;
  element.className = `notice ${type}`;
  element.classList.remove('hidden');
}

function hideMessage(element) {
  if (!element) return;
  element.className = 'notice hidden';
  element.textContent = '';
}

function escapeHtml(text = '') {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getStoragePathFromUrl(url) {
  if (!url || !url.includes(`/storage/v1/object/public/${BUCKET_NAME}/`)) return null;
  const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
  return decodeURIComponent(url.split(marker)[1] || '');
}
