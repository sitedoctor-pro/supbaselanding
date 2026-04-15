const form = document.getElementById('productForm');
const productIdInput = document.getElementById('productId');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('imagePreview');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const formStatus = document.getElementById('formStatus');
const dashboardStatus = document.getElementById('dashboardStatus');
const dashboardList = document.getElementById('dashboardList');
const dashboardTemplate = document.getElementById('dashboardItemTemplate');
const refreshDashboardBtn = document.getElementById('refreshDashboardBtn');

let currentProducts = [];
let currentImagePath = '';

imageInput?.addEventListener('change', () => {
  const file = imageInput.files?.[0];
  if (!file) return;
  imagePreview.src = URL.createObjectURL(file);
});

function resetForm() {
  form.reset();
  productIdInput.value = '';
  currentImagePath = '';
  imagePreview.src = FALLBACK_IMAGE;
  formTitle.textContent = 'إضافة منتج جديد';
  submitBtn.textContent = 'حفظ المنتج';
  setStatus(formStatus, 'جاهز.', 'muted');
}

async function uploadImage(file) {
  if (!file) return currentImagePath;

  const extension = file.name.split('.').pop() || 'png';
  const filePath = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

  const { error } = await supabaseClient.storage
    .from(PRODUCT_BUCKET)
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;
  return filePath;
}

function renderDashboard(products) {
  dashboardList.innerHTML = '';

  if (!products.length) {
    setStatus(dashboardStatus, 'مازال ما كاين حتى منتج.', 'muted');
    return;
  }

  const fragment = document.createDocumentFragment();

  products.forEach((product) => {
    const clone = dashboardTemplate.content.cloneNode(true);
    const article = clone.querySelector('.dashboard-item');
    const image = clone.querySelector('.dashboard-item-image');
    const title = clone.querySelector('.dashboard-item-title');
    const description = clone.querySelector('.dashboard-item-description');
    const editBtn = clone.querySelector('.edit-btn');
    const deleteBtn = clone.querySelector('.delete-btn');

    image.src = getPublicImageUrl(product.image_url);
    image.alt = product.title || 'صورة المنتج';
    title.textContent = product.title || 'بدون عنوان';
    description.textContent = product.description || 'بدون وصف';
    article.dataset.id = product.id;

    editBtn.addEventListener('click', () => startEdit(product.id));
    deleteBtn.addEventListener('click', () => deleteProduct(product.id));

    fragment.appendChild(clone);
  });

  dashboardList.appendChild(fragment);
  setStatus(dashboardStatus, `تم تحميل ${products.length} منتج.`, 'success');
}

async function loadDashboardProducts() {
  setStatus(dashboardStatus, 'جاري تحميل المنتجات...', 'muted');
  try {
    currentProducts = await fetchProducts();
    renderDashboard(currentProducts);
  } catch (error) {
    console.error(error);
    setStatus(dashboardStatus, 'وقع مشكل فقراءة المنتجات.', 'error');
  }
}

function startEdit(id) {
  const product = currentProducts.find((item) => String(item.id) === String(id));
  if (!product) return;

  productIdInput.value = product.id;
  titleInput.value = product.title || '';
  descriptionInput.value = product.description || '';
  currentImagePath = product.image_url || '';
  imagePreview.src = getPublicImageUrl(product.image_url);
  formTitle.textContent = 'تعديل المنتج';
  submitBtn.textContent = 'تحديث المنتج';
  setStatus(formStatus, `كتعدل دابا: ${product.title}`, 'success');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function createSampleIfEmpty() {
  try {
    const products = await fetchProducts();
    if (products.length) return;

    const { error } = await supabaseClient.from(PRODUCT_TABLE).insert([
      {
        title: 'سماعات لاسلكية احترافية',
        description: 'منتج تجريبي مضاف تلقائياً باش تشوف كيفاش كيظهر العرض فالهوم. تقدر تعدلو أو تمسحو من الداشبورد.',
        image_url: 'assets/sample-product.svg'
      }
    ]);

    if (error) throw error;
  } catch (error) {
    console.error('Sample insert skipped:', error);
  }
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  submitBtn.disabled = true;
  setStatus(formStatus, 'جاري الحفظ...', 'muted');

  try {
    const id = productIdInput.value.trim();
    const file = imageInput.files?.[0];
    const imagePath = await uploadImage(file);

    const payload = {
      title: titleInput.value.trim(),
      description: descriptionInput.value.trim(),
      image_url: imagePath || currentImagePath || 'assets/sample-product.svg'
    };

    let response;

    if (id) {
      response = await supabaseClient
        .from(PRODUCT_TABLE)
        .update(payload)
        .eq('id', Number(id));
    } else {
      response = await supabaseClient
        .from(PRODUCT_TABLE)
        .insert([payload]);
    }

    if (response.error) throw response.error;

    setStatus(formStatus, 'تم حفظ المنتج بنجاح.', 'success');
    resetForm();
    await loadDashboardProducts();
  } catch (error) {
    console.error(error);
    setStatus(
      formStatus,
      'وقع مشكل فالحفظ. إلا كنت باغي التعديل والحذف يخدمو، خاصك تزيد policies ديال update و delete من الملف SQL اللي فالمشروع.',
      'error'
    );
  } finally {
    submitBtn.disabled = false;
  }
});

async function deleteProduct(id) {
  if (!confirm('واش متأكد بغيتي تمسح هاد المنتج؟')) return;

  try {
    const { error } = await supabaseClient
      .from(PRODUCT_TABLE)
      .delete()
      .eq('id', Number(id));

    if (error) throw error;

    setStatus(dashboardStatus, 'تم حذف المنتج بنجاح.', 'success');
    await loadDashboardProducts();
    if (String(productIdInput.value) === String(id)) resetForm();
  } catch (error) {
    console.error(error);
    setStatus(
      dashboardStatus,
      'الحذف ما خدمش لأن Supabase باقي ما فيهش delete policy. شغل الملف extra-policies.sql مرة وحدة.',
      'error'
    );
  }
}

resetBtn?.addEventListener('click', resetForm);
refreshDashboardBtn?.addEventListener('click', loadDashboardProducts);

window.addEventListener('DOMContentLoaded', async () => {
  resetForm();
  await createSampleIfEmpty();
  await loadDashboardProducts();
});
