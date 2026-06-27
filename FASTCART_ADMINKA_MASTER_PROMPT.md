# 🛠️ FASTCART ADMINKA — CLAUDE CODE MASTER PROMPT

## LOYIHA HAQIDA
Bu **FastCart** e-commerce platformasining **Admin paneli** — `store-api.softclub.tj` live API bilan ishlaydi.  
Stack: **React + TypeScript + Redux Toolkit + shadcn/ui + Tailwind CSS + i18next + React Router DOM**

---

## 📁 TO'LIQ ARXITEKTURA (hech narsa o'zgartirma, faqat shu strukturani tut)

```
FASTCART-ADMINKA/
├── public/
├── src/
│   ├── api/
│   │   ├── axiosInstance.ts          # JWT interceptor, 401 → /login redirect
│   │   ├── accountApi.ts             # POST /Account/register, /Account/login
│   │   ├── brandsApi.ts              # GET/POST/PUT/DELETE /Brand/*
│   │   ├── categoriesApi.ts          # GET/POST/PUT/DELETE /Category/*
│   │   ├── colorsApi.ts              # GET/POST/PUT/DELETE /Color/*
│   │   ├── productsApi.ts            # GET/POST/PUT/DELETE /Product/*
│   │   ├── subCategoryApi.ts         # GET/POST/PUT/DELETE /SubCategory/*
│   │   └── userProfileApi.ts         # GET/PUT/DELETE /UserProfile/*
│   │
│   ├── assets/
│   │   ├── hero.png
│   │   ├── logo-light.svg            # light mode logo
│   │   └── logo-dark.svg             # dark mode logo
│   │
│   ├── components/
│   │   ├── modals/
│   │   │   ├── ColorModal.tsx         # Add/Edit color modal
│   │   │   ├── DeleteModal.tsx        # Confirm delete modal
│   │   │   └── SuccessModal.tsx       # Success feedback modal
│   │   ├── ui/                        # shadcn/ui components (auto-generated)
│   │   ├── ErrorBoundary.tsx          # React ErrorBoundary wrapper
│   │   ├── LangToggle.tsx             # RU / EN / TJ switcher
│   │   ├── ThemeToggle.tsx            # Dark / Light toggle
│   │   └── theme-provider.tsx         # ThemeProvider (localStorage persist)
│   │
│   ├── hooks/
│   │   ├── useProducts.ts             # product list + filters custom hook
│   │   └── useProfile.ts              # current user profile hook
│   │
│   ├── Layout/
│   │   └── Layout.tsx                 # Sidebar + Header + <Outlet/>
│   │
│   ├── lib/
│   │   └── utils.ts                   # cn() helper (shadcn)
│   │
│   ├── pages/
│   │   ├── dashboard/
│   │   │   ├── DashboardChart.tsx
│   │   │   ├── DashboardRecentTransactions.tsx
│   │   │   ├── DashboardTopProducts.tsx
│   │   │   ├── DashboardTopUnits.tsx
│   │   │   └── StatCard.tsx
│   │   ├── products/
│   │   │   ├── components/
│   │   │   │   ├── ProductBasicInfo.tsx
│   │   │   │   ├── ProductMedia.tsx
│   │   │   │   ├── ProductOptions.tsx
│   │   │   │   ├── ProductPricing.tsx
│   │   │   │   └── ProductSidebar.tsx
│   │   │   ├── ProductPagination.tsx
│   │   │   ├── ProductTable.tsx
│   │   │   └── ProductToolbar.tsx
│   │   ├── AddProduct.tsx
│   │   ├── Categories.tsx
│   │   ├── Colors.tsx
│   │   ├── Dashboard.tsx
│   │   ├── EditProduct.tsx
│   │   ├── Login.tsx
│   │   ├── NotFound.tsx               # 404 page
│   │   ├── Orders.tsx
│   │   ├── Other.tsx
│   │   └── Products.tsx
│   │
│   ├── providers/
│   │   └── AuthProvider.tsx           # JWT check, redirect logic
│   │
│   ├── router/
│   │   └── router.tsx                 # Routes + lazy + ProtectedRoute
│   │
│   ├── store/
│   │   ├── authSlice.ts               # login, register, token state
│   │   ├── brandsSlice.ts             # brands CRUD + createAsyncThunk
│   │   ├── categoriesSlice.ts         # categories CRUD + createAsyncThunk
│   │   ├── colorsSlice.ts             # colors CRUD + createAsyncThunk
│   │   ├── productsSlice.ts           # products CRUD + filters + pagination
│   │   ├── profileSlice.ts            # user profile state
│   │   └── index.ts                   # configureStore, RootState, AppDispatch
│   │
│   ├── types/
│   │   └── index.ts                   # TypeScript interfaces (API response shapes)
│   │
│   ├── App.tsx
│   ├── i18n.ts                        # i18next setup (RU/EN/TJ)
│   ├── index.css
│   └── main.tsx
│
├── locales/
│   ├── ru/translation.json
│   ├── en/translation.json
│   └── tj/translation.json
│
├── .env
├── .env.example
├── components.json                    # shadcn config
├── index.html
├── package.json
├── tsconfig.app.json
├── tsconfig.json
└── vite.config.ts                     # @ alias
```

---

## 🌐 API — BASE URL VA ENDPOINT MAPPING

```
BASE_URL = https://store-api.softclub.tj
IMAGE_URL = https://store-api.softclub.tj/images/   # <filename> dan rasm URL yasash
```

### Response shape (HAMMA endpoint):
```typescript
interface ApiResponse<T> {
  data: T
  errors: string[]
  statusCode: number
}

interface PaginatedResponse<T> {
  pageNumber: number
  pageSize: number
  totalPage: number
  totalRecord: number
  data: T[]
  errors: string[]
  statusCode: number
}
```

### Endpoints:

#### AUTH
```
POST /Account/register   body: { userName, phoneNumber, email, password, confirmPassword }
POST /Account/login      body: { userName, password }  → returns JWT token in data
```

#### BRANDS
```
GET    /Brand/get-brands?BrandName=&BrandId=&PageNumber=&PageSize=
GET    /Brand/get-brand-by-id?id=
POST   /Brand/add-brand?BrandName=          🔒 Bearer
PUT    /Brand/update-brand?Id=&BrandName=   🔒 Bearer
DELETE /Brand/delete-brand?id=              🔒 Bearer
```

#### CATEGORIES
```
GET    /Category/get-categories
GET    /Category/get-category-by-id?id=
POST   /Category/add-category     multipart: { CategoryImage: File, CategoryName }  🔒
PUT    /Category/update-category  multipart: { Id, CategoryImage: File, CategoryName }  🔒
DELETE /Category/delete-category?id=  🔒
```

#### COLORS
```
GET    /Color/get-colors?ColorName=&PageNumber=&PageSize=
GET    /Color/get-color-by-id?id=
POST   /Color/add-color?ColorName=   🔒
PUT    /Color/update-color?Id=&ColorName=
DELETE /Color/delete-color?id=  🔒
```

#### PRODUCTS
```
GET    /Product/get-products?UserId=&ProductName=&MinPrice=&MaxPrice=&BrandId=&ColorId=&CategoryId=&SubcategoryId=&PageNumber=&PageSize=
GET    /Product/get-product-by-id?id=
POST   /Product/add-product   multipart: { Images[], BrandId, ColorId, ProductName, Description, Quantity, Weight?, Size?, Code, Price, HasDiscount, DiscountPrice?, SubCategoryId }  🔒
PUT    /Product/update-product?Id=&BrandId=&ColorId=&ProductName=&Description=&Quantity=&Weight=&Size=&Code=&Price=&HasDiscount=&DiscountPrice=&SubCategoryId=  🔒
POST   /Product/add-image-to-product  multipart: { ProductId, Files[] }  🔒
DELETE /Product/delete-image-from-product?imageId=  🔒
DELETE /Product/delete-product?id=  🔒
```

#### SUBCATEGORY
```
GET    /SubCategory/get-sub-category
GET    /SubCategory/get-sub-category-by-id?id=
POST   /SubCategory/add-sub-category?CategoryId=&SubCategoryName=  🔒
PUT    /SubCategory/update-sub-category?Id=&CategoryId=&SubCategoryName=  🔒
DELETE /SubCategory/delete-sub-category?id=  🔒
```

#### USER PROFILE
```
GET    /UserProfile/get-user-profiles?UserName=&PageNumber=&PageSize=  🔒
GET    /UserProfile/get-user-profile-by-id?id=  🔒
PUT    /UserProfile/update-user-profile  multipart: { Image, FirstName, LastName, Email, PhoneNumber, Dob }  🔒
DELETE /UserProfile/delete-user?id=  🔒
POST   /UserProfile/addrole-from-user?UserId=&RoleId=  🔒
DELETE /UserProfile/remove-role-from-user?UserId=&RoleId=  🔒
GET    /UserProfile/get-user-roles  🔒
```

---

## ⚙️ MUHIM KONFIGURATSIYALAR

### .env
```env
VITE_API_URL=https://store-api.softclub.tj
VITE_IMAGE_URL=https://store-api.softclub.tj/images/
```

### axiosInstance.ts
```typescript
// - baseURL dan VITE_API_URL
// - request interceptor: localStorage dan token olib Authorization: Bearer <token> qo'sh
// - response interceptor: 401 da localStorage.clear() va window.location.href = '/login'
```

### vite.config.ts — @ alias
```typescript
resolve: { alias: { '@': path.resolve(__dirname, './src') } }
```

### i18n.ts — 3 til
```typescript
// resources: { ru, en, tj }
// locales/ papkasidan JSON fayllari
// localStorage da 'i18n_lang' kalit
// fallbackLng: 'ru'
```

### router.tsx — lazy + ProtectedRoute
```typescript
// Barcha page componentlari React.lazy() bilan import
// Suspense fallback: <LoadingSpinner />
// ProtectedRoute: token yo'q bo'lsa /login ga redirect
// PublicRoute: token bor bo'lsa /dashboard ga redirect
// 404: path="*" → <NotFound />
```

### ErrorBoundary.tsx
```typescript
// Class component, getDerivedStateFromError + componentDidCatch
// fallback UI: xato xabari + "Qaytarish" tugmasi
```

---

## 🏗️ REDUX SLICES PATTERN (har bir slice uchun bir xil pattern)

```typescript
// createAsyncThunk → API call → 
// extraReducers: pending → loading:true, fulfilled → data set, rejected → error set
// State shape: { items: [], loading: false, error: null, pagination: {...} }
// Export: actions + thunks + selectors
```

### authSlice.ts
```typescript
// State: { token: string|null, loading, error }
// Thunks: loginThunk, registerThunk
// Actions: logout (localStorage.clear())
// Persist: token localStorage da saqlash
```

### productsSlice.ts
```typescript
// State: { items: Product[], loading, error, filters: {}, pagination: {} }
// Thunks: fetchProducts, fetchProductById, addProduct, updateProduct, deleteProduct
// Actions: setFilters, resetFilters, setPage
```

---

## 🖼️ RASM URL YASASH

```typescript
// categoryImage → `${import.meta.env.VITE_IMAGE_URL}${item.categoryImage}`
// product images → array, har biri: `${import.meta.env.VITE_IMAGE_URL}${img}`
```

---

## 🎨 UI/UX TALABLAR

- **shadcn/ui** — barcha form, dialog, table, button, input, badge, select, toast
- **Tailwind CSS** — layout va spacing
- **Dark/Light mode** — ThemeProvider + ThemeToggle, CSS variables, localStorage persist
- **i18next** — hamma text `t('key')` orqali, hech qanday hardcoded string yo'q
- **Loading states** — har bir async action uchun Skeleton yoki Spinner
- **Error states** — API xatolari toast yoki inline alert orqali
- **Responsive** — sidebar collapsible mobile uchun

---

## 📋 SAHIFALAR VA FUNKSIONALLIK

### Login.tsx
- userName + password forma
- loginThunk dispatch
- Token localStorage ga saqlash
- /dashboard ga redirect

### Dashboard.tsx
- StatCard × 4 (mahsulotlar, kategoriyalar, brendlar, foydalanuvchilar)
- DashboardChart (recharts LineChart/BarChart)
- DashboardTopProducts, DashboardTopUnits, DashboardRecentTransactions

### Products.tsx
- ProductToolbar: qidiruv, filter (Category, Brand, Color, Price range), "Mahsulot qo'shish" tugmasi
- ProductTable: rasm, nom, narx, miqdor, brend, kategoriya, harakatlar
- ProductPagination: server-side pagination
- Delete → DeleteModal → deleteProduct thunk

### AddProduct.tsx / EditProduct.tsx
- ProductBasicInfo: nom, tavsif, kod, miqdor, og'irlik, o'lcham
- ProductPricing: narx, chegirma toggle, chegirma narxi
- ProductOptions: brend (select), rang (select), subkategoriya (select)
- ProductMedia: drag-drop rasm yuklash, preview
- ProductSidebar: saqlash/bekor qilish tugmalari, status

### Categories.tsx
- Table: rasm, nom, subkategoriyalar soni
- Add/Edit → modal (rasm yuklash bilan)
- Delete → DeleteModal

### Colors.tsx
- Table: id, rang nomi
- ColorModal: add/edit
- Delete → DeleteModal

### Orders.tsx
- Placeholder (API da order endpoint yo'q hozir)

---

## 🚀 LOYIHANI BOSHLASH TARTIBI

```bash
# 1. Dependencies
npm install

# 2. shadcn init (agar qilinmagan bo'lsa)
npx shadcn@latest init

# 3. Kerakli shadcn komponentlari
npx shadcn@latest add button input label dialog table badge select toast skeleton card separator dropdown-menu

# 4. i18next
npm install i18next react-i18next i18next-browser-languagedetector

# 5. recharts (dashboard uchun)
npm install recharts

# 6. Dev server
npm run dev
```

---

## ⚠️ MUHIM QOIDALAR (Claude Code uchun)

1. **Mavjud fayllarni o'CHIRMA** — faqat shu arxitekturadagi fayllarni to'ldir
2. **Har bir API call** `createAsyncThunk` bilan, to'g'ridan-to'g'ri fetch yo'q
3. **TypeScript** — `any` ishlatma, barcha response va state uchun interface yoz
4. **Rasm URL** — har doim `VITE_IMAGE_URL + filename` pattern
5. **🔒 endpoints** — `axiosInstance` ishlatadi (interceptor JWT qo'shadi)
6. **Public endpoints** — ham `axiosInstance` ishlatadi (interceptor zarar qilmaydi)
7. **Multipart forms** — `FormData` bilan `Content-Type: multipart/form-data`
8. **Pagination** — server-side, `PageNumber` va `PageSize` query params
9. **i18n** — hech qanday hardcoded string yo'q, hamma narsa `t('...')`
10. **Theme** — `dark:` prefix Tailwind classlar bilan, CSS variables

---

## 🏁 BOSHLASH BUYRUG'I (Claude Code uchun)

```
Shu MASTER PROMPT asosida FASTCART-ADMINKA loyihasini implement qil.
Mavjud fayl/papka strukturasini SAQLa, faqat kontentni to'ldir.
Birinchi navbatda:
1. src/types/index.ts — barcha TypeScript interfacelar
2. src/api/axiosInstance.ts — JWT interceptor
3. src/api/*.ts — barcha API fayllar
4. src/store/*.ts — barcha Redux slicelar
5. src/router/router.tsx — lazy routes + ProtectedRoute
6. src/providers/AuthProvider.tsx
7. src/components/ErrorBoundary.tsx
8. src/i18n.ts + locales/
9. Pages va components
```
