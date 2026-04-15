const productsGrid = document.getElementById('productsGrid');
const statusMessage = document.getElementById('statusMessage');
const refreshProductsBtn = document.getElementById('refreshProductsBtn');

function productCardTemplate(product) {
  const title = escapeHtml(product.title || 'Untitled product');
  const description = escapeHtml(product.description || 'No description');
  const imageUrl = product.image_url || 'product-sample.svg';

  return `
    <article class="product-card">
      <img src="${imageUrl}" alt="${title}" />
      <div class="product-card-content">
        <h3>${title}</h3>
        <p>${description}</p>
      </div>
    </article>
  `;
}

async function loadProducts() {
  hideMessage(statusMessage);
  productsGrid.innerHTML = '<div class="empty-state">Loading products...</div>';

  const { data, error } = await supabaseClient
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    productsGrid.innerHTML = '';
    showMessage(statusMessage, error.message, 'error');
    return;
  }

  if (!data || data.length === 0) {
    productsGrid.innerHTML = `
      <div class="empty-state">
        No products yet. Open the dashboard and add your first one.
      </div>
    `;
    return;
  }

  productsGrid.innerHTML = data.map(productCardTemplate).join('');
}

refreshProductsBtn?.addEventListener('click', loadProducts);
loadProducts();
