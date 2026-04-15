const userBadge = document.getElementById('userBadge');
const logoutBtn = document.getElementById('logoutBtn');
const productForm = document.getElementById('productForm');
const productIdInput = document.getElementById('productId');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const existingImageUrlInput = document.getElementById('existingImageUrl');
const imageFileInput = document.getElementById('imageFile');
const dashboardMessage = document.getElementById('dashboardMessage');
const dashboardProducts = document.getElementById('dashboardProducts');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const formTitle = document.getElementById('formTitle');
const refreshDashboardBtn = document.getElementById('refreshDashboardBtn');
const seedDemoBtn = document.getElementById('seedDemoBtn');

let currentSession = null;

async function requireAuth() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error || !data.session) {
    window.location.href = 'login.html';
    return;
  }

  currentSession = data.session;
  userBadge.textContent = data.session.user.email || 'Logged in';
}

function resetForm() {
  productForm.reset();
  productIdInput.value = '';
  formTitle.textContent = 'Add product';
  cancelEditBtn.classList.add('hidden');
}

function dashboardItemTemplate(product) {
  const title = escapeHtml(product.title || 'Untitled product');
  const description = escapeHtml(product.description || 'No description');
  const imageUrl = product.image_url || 'product-sample.svg';

  return `
    <article class="dashboard-item">
      <img src="${imageUrl}" alt="${title}" />
      <div>
        <h3>${title}</h3>
        <p>${description}</p>
        <div class="dashboard-actions">
          <button class="btn btn-ghost" type="button" data-action="edit" data-id="${product.id}">Edit</button>
          <button class="btn btn-danger" type="button" data-action="delete" data-id="${product.id}">Delete</button>
        </div>
      </div>
    </article>
  `;
}

async function loadDashboardProducts() {
  hideMessage(dashboardMessage);
  dashboardProducts.innerHTML = '<div class="empty-state">Loading products...</div>';

  const { data, error } = await supabaseClient
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    dashboardProducts.innerHTML = '';
    showMessage(dashboardMessage, error.message, 'error');
    return;
  }

  if (!data || data.length === 0) {
    dashboardProducts.innerHTML = '<div class="empty-state">No products yet.</div>';
    return;
  }

  dashboardProducts.innerHTML = data.map(dashboardItemTemplate).join('');
}

async function uploadImageIfNeeded() {
  const file = imageFileInput.files?.[0];
  if (!file) return null;

  const filePath = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const { error } = await supabaseClient.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, { upsert: true });

  if (error) throw error;

  const { data } = supabaseClient.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return data.publicUrl;
}

async function saveProduct(event) {
  event.preventDefault();
  hideMessage(dashboardMessage);

  const id = productIdInput.value.trim();
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  let imageUrl = existingImageUrlInput.value.trim();

  try {
    const uploadedUrl = await uploadImageIfNeeded();
    if (uploadedUrl) imageUrl = uploadedUrl;

    const payload = { title, description, image_url: imageUrl || null };

    let error;
    if (id) {
      ({ error } = await supabaseClient.from(TABLE_NAME).update(payload).eq('id', id));
    } else {
      ({ error } = await supabaseClient.from(TABLE_NAME).insert([payload]));
    }

    if (error) throw error;

    showMessage(dashboardMessage, id ? 'Product updated.' : 'Product created.', 'success');
    resetForm();
    await loadDashboardProducts();
  } catch (error) {
    showMessage(dashboardMessage, error.message, 'error');
  }
}

async function handleDashboardClick(event) {
  const action = event.target.dataset.action;
  const id = event.target.dataset.id;
  if (!action || !id) return;

  hideMessage(dashboardMessage);

  const { data: product, error } = await supabaseClient
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    showMessage(dashboardMessage, error.message, 'error');
    return;
  }

  if (action === 'edit') {
    productIdInput.value = product.id;
    titleInput.value = product.title || '';
    descriptionInput.value = product.description || '';
    existingImageUrlInput.value = product.image_url || '';
    imageFileInput.value = '';
    formTitle.textContent = 'Edit product';
    cancelEditBtn.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (action === 'delete') {
    const confirmed = window.confirm(`Delete "${product.title}"?`);
    if (!confirmed) return;

    const storagePath = getStoragePathFromUrl(product.image_url || '');

    if (storagePath) {
      await supabaseClient.storage.from(BUCKET_NAME).remove([storagePath]);
    }

    const { error: deleteError } = await supabaseClient.from(TABLE_NAME).delete().eq('id', id);
    if (deleteError) {
      showMessage(dashboardMessage, deleteError.message, 'error');
      return;
    }

    showMessage(dashboardMessage, 'Product deleted.', 'success');
    await loadDashboardProducts();
  }
}

async function addDemoProduct() {
  hideMessage(dashboardMessage);
  const payload = {
    title: 'Demo Product',
    description: 'This is a demo item created from the dashboard. You can edit or delete it anytime.',
    image_url: 'https://picsum.photos/seed/site-doctor-demo/1200/900',
  };

  const { error } = await supabaseClient.from(TABLE_NAME).insert([payload]);
  if (error) {
    showMessage(dashboardMessage, error.message, 'error');
    return;
  }

  showMessage(dashboardMessage, 'Demo product added.', 'success');
  await loadDashboardProducts();
}

logoutBtn?.addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  window.location.href = 'login.html';
});

productForm?.addEventListener('submit', saveProduct);
dashboardProducts?.addEventListener('click', handleDashboardClick);
cancelEditBtn?.addEventListener('click', resetForm);
refreshDashboardBtn?.addEventListener('click', loadDashboardProducts);
seedDemoBtn?.addEventListener('click', addDemoProduct);

(async function initDashboard() {
  await requireAuth();
  await loadDashboardProducts();
})();
