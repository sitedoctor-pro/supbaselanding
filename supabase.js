const SUPABASE_URL = 'https://yarrynilnisfvjctuswl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2X5M7UnsM929CZjGSdLNtQ_-Y2a74lX';

const PRODUCT_TABLE = 'site_content';
const PRODUCT_BUCKET = 'site-images';
const FALLBACK_IMAGE = 'assets/sample-product.svg';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDate(dateValue) {
  if (!dateValue) return 'الآن';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'الآن';
  return new Intl.DateTimeFormat('ar-MA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

function setStatus(element, message, type = 'muted') {
  if (!element) return;
  element.textContent = message;
  element.className = `status-box ${type}`;
}

function getPublicImageUrl(path) {
  if (!path) return FALLBACK_IMAGE;
  if (path.startsWith('http')) return path;
  const { data } = supabaseClient.storage.from(PRODUCT_BUCKET).getPublicUrl(path);
  return data.publicUrl || FALLBACK_IMAGE;
}

async function fetchProducts() {
  const { data, error } = await supabaseClient
    .from(PRODUCT_TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
