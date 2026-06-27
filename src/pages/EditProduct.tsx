import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { RootState, AppDispatch } from '@/store';
import { updateProduct, clearAddSuccess, type Product, type UpdateProductParams } from '@/store/productsSlice';
import { fetchCategories } from '@/store/categoriesSlice';
import { fetchBrands } from '@/store/brandsSlice';
import { fetchColors } from '@/store/colorsSlice';
import SuccessModal from '@/components/modals/SuccessModal';
import ColorModal from '@/components/modals/ColorModal';

import ProductBasicInfo from './products/components/ProductBasicInfo';
import ProductPricing from './products/components/ProductPricing';
import ProductOptions, { type OptionRow } from './products/components/ProductOptions';
import ProductMedia from './products/components/ProductMedia';
import ProductSidebar from './products/components/ProductSidebar';
import { cn } from "@/lib/utils";

const BASE = import.meta.env.VITE_API_URL as string;
const DEFAULT_OPTIONS: OptionRow[] = [];

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const descRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { categories } = useSelector((s: RootState) => s.categories);
  const { brands } = useSelector((s: RootState) => s.brands);
  const { colors } = useSelector((s: RootState) => s.colors);
  const { addLoading, addSuccess, addError } = useSelector((s: RootState) => s.products);
  const token = useSelector((s: RootState) => s.auth.token);

  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productName, setProductName] = useState('');
  const [code, setCode] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [subCatId, setSubCatId] = useState<number | ''>('');

  const subCategories = useMemo(
    () => categories.find(c => c.id === Number(categoryId))?.subCategories ?? [],
    [categories, categoryId]
  );
  const [brandId, setBrandId] = useState<number | ''>('');
  const [colorIds, setColorIds] = useState<number[]>([]);
  const [price, setPrice] = useState<number | ''>('');
  const [discount, setDiscount] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [hasTax, setHasTax] = useState(false);
  const [hasOptions, setHasOptions] = useState(true);
  const [options, setOptions] = useState<OptionRow[]>(DEFAULT_OPTIONS);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState<File[]>([]);
  
  // Барои пешгирӣ аз хатогии TypeScript типҳоро мувофиқ мекунем
  const [existingImages, setExistingImages] = useState<any[]>([]);
  
  const [isDragging, setIsDragging] = useState(false);
  const [showColorMdl, setShowColorMdl] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [descriptionHtml, setDescriptionHtml] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands());
    dispatch(fetchColors());
  }, [dispatch]);

  useEffect(() => {
    if (!id || !token) return;
    setLoadingProduct(true);
    fetch(`${BASE}/Product/get-product-by-id?id=${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(json => {
        const data = (json.data ?? json) as Product;
        setProductName(data.productName || '');
        setCode(data.code || '');
        setPrice(data.price || '');
        setDiscount(data.discountPrice || '');
        setQuantity(data.quantity || '');
        setCategoryId(data.categoryId || '');
        setSubCatId(data.subCategoryId || '');
        setBrandId(data.brandId || '');
        if (data.colorId) setColorIds([data.colorId]);
        if (data.description) setDescriptionHtml(data.description);

        const rawImages = data.images ?? [];
        if (rawImages.length > 0) {
          if (typeof rawImages[0] === 'string') {
            setExistingImages((rawImages as unknown as string[]).map((url, i) => ({ id: i, imageUrl: url })));
          } else {
            setExistingImages(rawImages as any[]);
          }
        } else if (data.image) {
          setExistingImages([{ id: 0, imageUrl: data.image }]);
        } else {
          setExistingImages([]);
        }
        
        const newOpts: OptionRow[] = [];
        if (data.size) newOpts.push({ name: 'Size', values: data.size.split(',').filter(Boolean), inputVal: '' });
        if (data.weight) newOpts.push({ name: 'Weight', values: data.weight.split(',').filter(Boolean), inputVal: '' });
        if (newOpts.length > 0) {
          setOptions(newOpts);
          setHasOptions(true);
        } else {
          setHasOptions(false);
          setOptions([]);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingProduct(false));
  }, [id, token]);

  useEffect(() => {
    if (!categoryId || !categories.length) return;
    const valid = new Set(
      (categories.find(c => c.id === Number(categoryId))?.subCategories ?? []).map(s => s.id)
    );
    setSubCatId(prev => (prev !== '' && !valid.has(Number(prev)) ? '' : prev));
  }, [categoryId, categories]);

  useEffect(() => {
    if (addSuccess) {
      setShowSuccess(true);
      dispatch(clearAddSuccess());
    }
  }, [addSuccess, dispatch]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!productName.trim()) e.productName = 'Product name is required';
    if (price === '' || Number(price) <= 0) e.price = 'Valid price is required';
    if (!subCatId) e.subCatId = 'Sub-category is required';
    if (!brandId) e.brandId = 'Brand is required';
    if (colorIds.length === 0) e.colorId = 'At least one color is required';
    if (!code.trim()) e.code = 'Product code is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!id) return;
    if (!validate()) return;

    const description = descRef.current ? (descRef.current.innerText || descRef.current.textContent || '') : '';
    const discountNum = discount !== '' ? Number(discount) : 0;
    const priceNum = Number(price);
    const hasDiscountVal = discountNum > 0 && discountNum < priceNum;

    const params: UpdateProductParams = {
      Id: Number(id),
      ProductName: productName.trim(),
      Price: priceNum,
      HasDiscount: hasDiscountVal,
      Quantity: quantity !== '' ? Number(quantity) : 0,
    };

    if (code.trim()) params.Code = code.trim();
    if (description.trim()) params.Description = description.trim();
    if (hasDiscountVal) params.DiscountPrice = discountNum;
    if (subCatId) params.SubCategoryId = Number(subCatId);
    if (brandId) params.BrandId = Number(brandId);
    if (colorIds.length > 0) params.ColorId = colorIds[0];

    dispatch(updateProduct(params));
  };

  const execFormat = (cmd: string) => {
    descRef.current?.focus();
    document.execCommand(cmd, false);
  };

  const handleDeleteExistingImage = async (imgId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    try {
      const res = await fetch(`${BASE}/ProductImage/delete-product-image?id=${imgId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setExistingImages(prev => prev.filter(img => img.id !== imgId));
      } else {
        alert('Failed to delete image');
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting image');
    }
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
    setImages(prev => [...prev, ...valid]);
  }, []);

  if (loadingProduct) {
    return (
      <div className={cn('flex', 'flex-col', 'items-center', 'justify-center', 'min-h-[400px]')}>
        <Loader2 size={32} className={cn('animate-spin', 'text-indigo-600', 'mb-4')} />
        <p className={cn('text-zinc-500', 'font-medium')}>Loading product data...</p>
      </div>
    );
  }

  return (
    <div className={cn('flex', 'flex-col', 'h-full', 'max-w-7xl', 'mx-auto')}>
      <div className={cn('flex', 'flex-col', 'sm:flex-row', 'sm:items-center', 'justify-between', 'gap-4', 'mb-8')}>
        <div className={cn('flex', 'items-center', 'gap-3')}>
          <button 
            onClick={() => navigate('/products')}
            className={cn('p-2', '-ml-2', 'rounded-lg', 'text-zinc-500', 'hover:text-zinc-900', 'hover:bg-zinc-100', 'dark:hover:text-white', 'dark:hover:bg-zinc-800', 'transition-colors')}
          >
            <ArrowLeft size={20} />
          </button>
          <div className={cn('flex', 'items-center', 'gap-2', 'text-sm')}>
            <span className={cn('text-zinc-500', 'dark:text-zinc-400', 'cursor-pointer', 'hover:text-zinc-900', 'dark:hover:text-white', 'transition-colors')} onClick={() => navigate('/products')}>Products</span>
            <span className={cn('text-zinc-300', 'dark:text-zinc-600')}>/</span>
            <span className={cn('font-medium', 'text-zinc-900', 'dark:text-white')}>Edit product</span>
          </div>
        </div>
        <div className={cn('flex', 'items-center', 'gap-3')}>
          <button 
            className={cn('px-4', 'py-2', 'text-sm', 'font-medium', 'text-zinc-700', 'dark:text-zinc-300', 'bg-white', 'dark:bg-zinc-900', 'border', 'border-zinc-200', 'dark:border-zinc-800', 'rounded-lg', 'hover:bg-zinc-50', 'dark:hover:bg-zinc-800', 'transition-colors', 'shadow-sm')} 
            onClick={() => navigate('/products')}
          >
            Cancel
          </button>
          <button 
            className={cn('flex', 'items-center', 'gap-2', 'px-4', 'py-2', 'text-sm', 'font-medium', 'text-white', 'bg-indigo-600', 'border', 'border-transparent', 'rounded-lg', 'hover:bg-indigo-500', 'disabled:opacity-70', 'transition-colors', 'shadow-sm')} 
            onClick={handleSave} 
            disabled={addLoading}
          >
            {addLoading && <Loader2 size={16} className="animate-spin" />}
            {addLoading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {addError && (
        <div className={cn('mb-6', 'p-4', 'rounded-lg', 'bg-red-50', 'dark:bg-red-500/10', 'border', 'border-red-200', 'dark:border-red-500/20', 'text-sm', 'text-red-600', 'dark:text-red-400', 'font-medium')}>
          {addError}
        </div>
      )}

      <div className={cn('flex', 'flex-col', 'lg:flex-row', 'gap-8', 'items-start')}>
        <div className={cn('w-full', 'lg:w-2/3', 'flex', 'flex-col', 'gap-0')}>
          <ProductBasicInfo
            productName={productName}
            setProductName={setProductName}
            productNameError={errors.productName}
            code={code}
            setCode={setCode}
            descRef={descRef}
            execFormat={execFormat}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            subCatId={subCatId}
            setSubCatId={setSubCatId}
            brandId={brandId}
            setBrandId={setBrandId}
            categories={categories}
            subCategories={subCategories}
            brands={brands}
            descriptionHtml={descriptionHtml}
            codeError={errors.code}
            categoryIdError={errors.categoryId}
            subCatIdError={errors.subCatId}
            brandIdError={errors.brandId}
          />
          
          <ProductPricing
            price={price}
            setPrice={setPrice}
            priceError={errors.price}
            discount={discount}
            setDiscount={setDiscount}
            quantity={quantity}
            setQuantity={setQuantity}
            hasTax={hasTax}
            setHasTax={setHasTax}
          />

          <ProductOptions
            hasOptions={hasOptions}
            setHasOptions={setHasOptions}
            options={options}
            updateOptName={(i, v) => setOptions(p => p.map((o, idx) => idx === i ? { ...o, name: v } : o))}
            updateOptInput={(i, v) => setOptions(p => p.map((o, idx) => idx === i ? { ...o, inputVal: v } : o))}
            addOptValue={(i) => {
              const val = options[i].inputVal.trim();
              if (!val) return;
              setOptions(p => p.map((o, idx) => idx === i && !o.values.includes(val) ? { ...o, values: [...o.values, val], inputVal: '' } : o));
            }}
            removeOptValue={(i, val) => setOptions(p => p.map((o, idx) => idx === i ? { ...o, values: o.values.filter(v => v !== val) } : o))}
            addOptionRow={() => setOptions(p => [...p, { name: '', values: [], inputVal: '' }])}
          />
        </div>

        <div className={cn('w-full', 'lg:w-1/3', 'flex', 'flex-col', 'gap-6')}>
          <ProductMedia
            images={images}
            existingImages={existingImages}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            handleDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
            handleFiles={handleFiles}
            fileRef={fileRef}
            removeNewImage={(i) => setImages(p => p.filter((_, idx) => idx !== i))}
            removeExistingImage={handleDeleteExistingImage}
            imagesError={errors.images}
          />

          <ProductSidebar
            colors={colors}
            colorIds={colorIds}
            toggleColor={(id) => setColorIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])}
            setShowColorMdl={setShowColorMdl}
            tags={tags}
            tagInput={tagInput}
            setTagInput={setTagInput}
            addTag={() => {
              const t = tagInput.trim();
              if (t && !tags.includes(t)) setTags(p => [...p, t]);
              setTagInput('');
            }}
            removeTag={(t) => setTags(p => p.filter(x => x !== t))}
            colorIdError={errors.colorId}
          />
        </div>
      </div>

      {showColorMdl && <ColorModal onClose={() => setShowColorMdl(false)} onCreated={() => dispatch(fetchColors())} />}
      {showSuccess && (
        <SuccessModal
          onGoToProducts={() => { setShowSuccess(false); navigate('/products'); }}
          onAddNew={() => {
            setShowSuccess(false);
            navigate('/products/add');
          }}
        />
      )}
    </div>
  );
}