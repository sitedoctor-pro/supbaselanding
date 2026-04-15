const productsGrid = document.getElementById('productsGrid');
const statusBox = document.getElementById('statusBox');
const template = document.getElementById('productTemplate');
const reloadBtn = document.getElementById('reloadBtn');

function renderProducts(products) {
  productsGrid.innerHTML = '';

  if (!products.length) {
    setStatus(statusBox, 'مازال ما كاين حتى منتج. زيد أول منتج من الداشبورد.', 'muted');
    return;
  }

  const fragment = document.createDocumentFragment();

  products.forEach((product) => {
    const clone = template.content.cloneNode(true);
    const image = clone.querySelector('.product-image');
    const title = clone.querySelector('.product-title');
    const description = clone.querySelector('.product-description');
    const date = clone.querySelector('.product-date');

    image.src = getPublicImageUrl(product.image_url);
    image.alt = product.title || 'صورة المنتج';
    title.textContent = product.title || 'بدون عنوان';
    description.textContent = product.description || 'بدون وصف';
    date.textContent = formatDate(product.created_at);

    fragment.appendChild(clone);
  });

  productsGrid.appendChild(fragment);
  setStatus(statusBox, `تم تحميل ${products.length} منتج بنجاح.`, 'success');
}

async function loadProducts() {
  setStatus(statusBox, 'جاري تحميل المنتجات...', 'muted');
  try {
    const products = await fetchProducts();
    renderProducts(products);
  } catch (error) {
    console.error(error);
    setStatus(statusBox, 'وقع مشكل فقراءة المنتجات من Supabase.', 'error');
  }
}

reloadBtn?.addEventListener('click', loadProducts);
window.addEventListener('DOMContentLoaded', loadProducts);
