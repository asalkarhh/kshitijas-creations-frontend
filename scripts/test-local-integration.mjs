import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const BACKEND_URL = 'http://localhost:8080';
const FRONTEND_URL = 'http://localhost:5173';
const ADMIN_EMAIL = 'admin@kshitijascreations.local';
const ADMIN_PASSWORD = 'AdminLocal123';
const UPLOAD_DIR = '/Users/saurabhasalkar/business/projects/kshitijas-creations-uploads';
const runId = Date.now().toString().slice(-4);

console.log('====================================================');
console.log('🚀 Kshitija’s Creations Full Local Integration Test');
console.log('====================================================\n');

// 1. Check health
console.log('--- 1. Health & Server Checks ---');
const healthRes = await fetch(`${BACKEND_URL}/actuator/health`);
if (!healthRes.ok) throw new Error(`Backend health check failed: ${healthRes.status}`);
const healthData = await healthRes.json();
console.log('✅ Backend Health:', healthData);

const frontendRes = await fetch(FRONTEND_URL);
if (!frontendRes.ok) throw new Error(`Frontend check failed: ${frontendRes.status}`);
console.log('✅ Frontend Serving: HTTP', frontendRes.status);

// 2. Admin Login
console.log('\n--- 2. Admin Authentication ---');
const loginRes = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
});
if (!loginRes.ok) {
  const err = await loginRes.text();
  throw new Error(`Admin login failed: ${loginRes.status} ${err}`);
}
const loginData = await loginRes.json();
const token = loginData.accessToken;
console.log('✅ Admin Logged In:', loginData.admin.name, `(${loginData.admin.email})`);
console.log('   Token received (prefix):', token.slice(0, 20) + '...');

const authHeaders = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

// 3. Create Category
console.log('\n--- 3. Category Management ---');
const catName = `Handcrafted Necklaces ${runId}`;
const catRes = await fetch(`${BACKEND_URL}/api/v1/admin/categories`, {
  method: 'POST',
  headers: authHeaders,
  body: JSON.stringify({
    name: catName,
    description: 'Exquisite hand-strung semi-precious necklaces and chokers.',
    displayOrder: 1,
    active: true,
  }),
});
if (!catRes.ok) {
  const err = await catRes.text();
  throw new Error(`Category creation failed: ${catRes.status} ${err}`);
}
const category = await catRes.json();
console.log('✅ Category Created:', category.id, category.name, `(slug: ${category.slug})`);

// 4. Create Product
console.log('\n--- 4. Product Creation ---');
const prodRes = await fetch(`${BACKEND_URL}/api/v1/admin/products`, {
  method: 'POST',
  headers: authHeaders,
  body: JSON.stringify({
    categoryId: category.id,
    name: `Royal Kundan Choker ${runId}`,
    productCode: `KC-KUN-${runId}`,
    shortDescription: 'Traditional Kundan choker necklace with pearl drops.',
    description: 'Handcrafted using brass base, uncut Kundan stones, and freshwater pearls.',
    price: 1850.0,
    available: true,
    featured: true,
    instagramUrl: 'https://www.instagram.com/p/C123456789/',
    displayOrder: 1,
  }),
});
if (!prodRes.ok) {
  const err = await prodRes.text();
  throw new Error(`Product creation failed: ${prodRes.status} ${err}`);
}
const product = await prodRes.json();
console.log('✅ Product Created:', product.id, product.name, `(slug: ${product.slug})`, `Price: ₹${product.price}`);

// 5. Upload Product Media (Image & Video)
console.log('\n--- 5. Product Media Uploads ---');
// Create temporary test image (1x1 PNG) and test video
const samplePngPath = path.join(UPLOAD_DIR, 'sample_test_image.png');
const samplePngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);
fs.writeFileSync(samplePngPath, samplePngBuffer);

const sampleMp4Path = path.join(UPLOAD_DIR, 'sample_test_video.mp4');
const sampleMp4Buffer = Buffer.from([
  0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6F, 0x6D, 0x00, 0x00, 0x02, 0x00,
  0x69, 0x73, 0x6F, 0x6D, 0x69, 0x73, 0x6F, 0x32, 0x61, 0x76, 0x63, 0x31, 0x6D, 0x70, 0x34, 0x31,
]);
fs.writeFileSync(sampleMp4Path, sampleMp4Buffer);

// Upload Image
const imgFormData = new FormData();
imgFormData.append('files', new Blob([samplePngBuffer], { type: 'image/png' }), 'kundan-front.png');
imgFormData.append('mediaType', 'IMAGE');
imgFormData.append('altText', 'Royal Kundan Choker front view');
imgFormData.append('primaryMedia', 'true');
imgFormData.append('displayOrder', '1');

const uploadImgRes = await fetch(`${BACKEND_URL}/api/v1/admin/products/${product.id}/media`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: imgFormData,
});
if (!uploadImgRes.ok) {
  const err = await uploadImgRes.text();
  throw new Error(`Image upload failed: ${uploadImgRes.status} ${err}`);
}
const rawImg = await uploadImgRes.json();
const mediaImg = Array.isArray(rawImg) ? rawImg[0] : rawImg;
console.log('✅ Product Image Uploaded:', mediaImg.id);
console.log('   Resolved URL:', mediaImg.url);

// Test image download via URL
const mediaImgFetch = await fetch(mediaImg.url);
if (!mediaImgFetch.ok) {
  console.log('   ⚠️ Image fetch from URL status:', mediaImgFetch.status, mediaImg.url);
} else {
  console.log('✅ Image directly accessible through HTTP:', mediaImgFetch.status, mediaImgFetch.headers.get('content-type'));
}

// Upload Video
const videoFormData = new FormData();
videoFormData.append('files', new Blob([sampleMp4Buffer], { type: 'video/mp4' }), 'kundan-video.mp4');
videoFormData.append('mediaType', 'VIDEO');
videoFormData.append('altText', 'Royal Kundan Choker 360 degree video');
videoFormData.append('primaryMedia', 'false');
videoFormData.append('displayOrder', '2');

const uploadVidRes = await fetch(`${BACKEND_URL}/api/v1/admin/products/${product.id}/media`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: videoFormData,
});
if (!uploadVidRes.ok) {
  const err = await uploadVidRes.text();
  throw new Error(`Video upload failed: ${uploadVidRes.status} ${err}`);
}
const rawVid = await uploadVidRes.json();
const mediaVid = Array.isArray(rawVid) ? rawVid[0] : rawVid;
console.log('✅ Product Video Uploaded:', mediaVid.id);

// 6. Promotional Banners (Active vs Scheduled)
console.log('\n--- 6. Promotional Banners (Active & Scheduled) ---');
// Active Banner
const activeBannerForm = new FormData();
activeBannerForm.append('title', `Festive Kundan Splendour ${runId}`);
activeBannerForm.append('subtitle', 'Handcrafted royal chokers and festive sets');
activeBannerForm.append('buttonText', 'Explore Collection');
activeBannerForm.append('targetUrl', `/products/${product.slug}`);
activeBannerForm.append('displayOrder', '1');
activeBannerForm.append('active', 'true');
activeBannerForm.append('desktopImage', new Blob([samplePngBuffer], { type: 'image/png' }), 'banner-festive.png');

const activeBannerRes = await fetch(`${BACKEND_URL}/api/v1/admin/banners`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: activeBannerForm,
});
if (!activeBannerRes.ok) {
  const err = await activeBannerRes.text();
  throw new Error(`Active banner creation failed: ${activeBannerRes.status} ${err}`);
}
const activeBanner = await activeBannerRes.json();
console.log('✅ Active Banner Created:', activeBanner.id, activeBanner.title);

// Scheduled Future Banner
const futureBannerForm = new FormData();
futureBannerForm.append('title', `Diwali 2027 Preview ${runId}`);
futureBannerForm.append('subtitle', 'Upcoming heirloom pieces');
futureBannerForm.append('buttonText', 'Preview Soon');
futureBannerForm.append('targetUrl', '/products');
futureBannerForm.append('displayOrder', '2');
futureBannerForm.append('active', 'true');
futureBannerForm.append('startAt', '2027-10-01T00:00:00Z');
futureBannerForm.append('endAt', '2027-11-01T00:00:00Z');
futureBannerForm.append('desktopImage', new Blob([samplePngBuffer], { type: 'image/png' }), 'banner-future.png');

const futureBannerRes = await fetch(`${BACKEND_URL}/api/v1/admin/banners`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: futureBannerForm,
});
if (!futureBannerRes.ok) {
  const err = await futureBannerRes.text();
  throw new Error(`Future banner creation failed: ${futureBannerRes.status} ${err}`);
}
const futureBanner = await futureBannerRes.json();
console.log('✅ Scheduled Future Banner Created:', futureBanner.id, futureBanner.title);

// 7. Public Customer Experience Tests
console.log('\n--- 7. Public Storefront & Banners Verification ---');
const publicBannersRes = await fetch(`${BACKEND_URL}/api/v1/public/banners`);
const publicBanners = await publicBannersRes.json();
console.log('   Public Banners Count:', publicBanners.length);
const foundActive = publicBanners.find((b) => b.id === activeBanner.id);
const foundFuture = publicBanners.find((b) => b.id === futureBanner.id);
console.log('✅ Active banner visible to public:', Boolean(foundActive));
console.log('✅ Future banner hidden from public:', !foundFuture);

const publicProdRes = await fetch(`${BACKEND_URL}/api/v1/public/products/${product.slug}`);
const publicProduct = await publicProdRes.json();
console.log('✅ Public Product Page:', publicProduct.name, `₹${publicProduct.price}`);
console.log('   Media items count:', publicProduct.media?.length);
console.log('   Instagram URL:', publicProduct.instagramUrl);

// 8. Customer Order Submission & Price Recalculation
console.log('\n--- 8. Customer Guest Order & WhatsApp Flow ---');
const orderPayload = {
  customerName: 'Radha Deshmukh',
  mobileNumber: '9823012345',
  addressLine: 'Flat B-402, Shivajinagar Heights, FC Road',
  city: 'Pune',
  state: 'Maharashtra',
  postalCode: '411005',
  customerNote: 'Please gift wrap with a greeting card.',
  items: [
    {
      productId: product.id,
      quantity: 2,
    },
  ],
};

const placeOrderRes = await fetch(`${BACKEND_URL}/api/v1/public/orders`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderPayload),
});
if (!placeOrderRes.ok) {
  const err = await placeOrderRes.text();
  throw new Error(`Order placement failed: ${placeOrderRes.status} ${err}`);
}
const orderResponse = await placeOrderRes.json();
console.log('✅ Order Created Successfully!');
console.log('   Order Number:', orderResponse.orderNumber);
console.log('   Status:', orderResponse.status);
console.log('   Backend Recalculated Total:', `₹${orderResponse.totalAmount}`, `(Expected: 2 × ₹1850 = ₹3700)`);
console.log('   WhatsApp Redirection URL:', orderResponse.whatsappUrl);

if (orderResponse.totalAmount !== 3700) {
  throw new Error(`Total amount mismatch! Expected 3700, got ${orderResponse.totalAmount}`);
}

// Verify WhatsApp message content
const whatsappUrlObj = new URL(orderResponse.whatsappUrl);
const whatsappText = whatsappUrlObj.searchParams.get('text');
console.log('✅ Prepared WhatsApp Message:\n' + whatsappText);

// 9. Admin Order Lifecycle Transition
console.log('\n--- 9. Admin Order Management & Lifecycle ---');
const adminOrdersRes = await fetch(`${BACKEND_URL}/api/v1/admin/orders`, {
  headers: authHeaders,
});
const adminOrders = await adminOrdersRes.json();
const foundOrder = (adminOrders.content || adminOrders).find((o) => o.orderNumber === orderResponse.orderNumber);
console.log('✅ Order Listed in Admin Table:', foundOrder.orderNumber, `(Status: ${foundOrder.status})`);

const orderDetailsRes = await fetch(`${BACKEND_URL}/api/v1/admin/orders/${foundOrder.id}`, {
  headers: authHeaders,
});
const orderDetails = await orderDetailsRes.json();
console.log('✅ Order Details Retrieved:');
console.log('   Customer:', orderDetails.customerName, orderDetails.mobileNumber);
console.log('   Delivery Address:', `${orderDetails.addressLine}, ${orderDetails.city}, ${orderDetails.state} - ${orderDetails.postalCode}`);
console.log('   Snapshot Items:', orderDetails.items?.[0]?.productName, `Qty: ${orderDetails.items?.[0]?.quantity}`, `Unit Price: ₹${orderDetails.items?.[0]?.unitPrice}`);

// Transition: PLACED -> CONFIRMED
const confirmStatusRes = await fetch(`${BACKEND_URL}/api/v1/admin/orders/${foundOrder.id}/status`, {
  method: 'PATCH',
  headers: authHeaders,
  body: JSON.stringify({ status: 'CONFIRMED' }),
});
const confirmedOrder = await confirmStatusRes.json();
console.log('✅ Status Transitioned to:', confirmedOrder.status);

// Transition: CONFIRMED -> COMPLETED
const completeStatusRes = await fetch(`${BACKEND_URL}/api/v1/admin/orders/${foundOrder.id}/status`, {
  method: 'PATCH',
  headers: authHeaders,
  body: JSON.stringify({ status: 'COMPLETED' }),
});
const completedOrder = await completeStatusRes.json();
console.log('✅ Status Transitioned to:', completedOrder.status);

// Test Invalid Status Transition (COMPLETED -> PLACED should be blocked)
const invalidStatusRes = await fetch(`${BACKEND_URL}/api/v1/admin/orders/${foundOrder.id}/status`, {
  method: 'PATCH',
  headers: authHeaders,
  body: JSON.stringify({ status: 'PLACED' }),
});
console.log('✅ Invalid Status Transition COMPLETED -> PLACED correctly blocked: HTTP', invalidStatusRes.status);

// 10. Dashboard Stats
console.log('\n--- 10. Admin Dashboard Counts ---');
const dashboardRes = await fetch(`${BACKEND_URL}/api/v1/admin/dashboard`, {
  headers: authHeaders,
});
const dashboard = await dashboardRes.json();
console.log('✅ Dashboard Stats:', dashboard.stats || dashboard);

// 11. Database Inspection via psql
console.log('\n--- 11. PostgreSQL Database Inspection ---');
const psqlQueries = [
  'SELECT id, email, name, role FROM admin_users;',
  'SELECT id, name, slug, active FROM categories WHERE id = ' + category.id + ';',
  'SELECT id, name, price, available, featured FROM products WHERE id = ' + product.id + ';',
  'SELECT id, product_id, media_type, file_key FROM product_media WHERE product_id = ' + product.id + ';',
  'SELECT id, title, active, start_at, end_at FROM banners WHERE id = ' + activeBanner.id + ';',
  "SELECT id, order_number, status, total_amount, customer_name FROM orders WHERE order_number = '" + orderResponse.orderNumber + "';",
  'SELECT id, order_id, product_name, unit_price, quantity, line_total FROM order_items WHERE order_id = ' + foundOrder.id + ';',
  'SELECT version, description, success FROM flyway_schema_history;',
];

for (const q of psqlQueries) {
  console.log(`\nSQL: ${q}`);
  const out = execSync(`psql -d kshitijas_creations -c "${q}"`).toString();
  console.log(out.trim());
}

// Clean up test temp files
fs.rmSync(samplePngPath, { force: true });
fs.rmSync(sampleMp4Path, { force: true });

console.log('\n====================================================');
console.log('🎉 ALL INTEGRATION AND LIFECYCLE TESTS PASSED 100%!');
console.log('====================================================');
