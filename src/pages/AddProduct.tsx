import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { RootState, AppDispatch } from '@/store';
import { addProduct, clearAddSuccess, fetchProducts } from '@/store/productsSlice';
import { fetchCategories } from '@/store/categoriesSlice';
import { fetchBrands } from '@/store/brandsSlice';
import { fetchColors } from '@/store/colorsSlice';
import ColorModal from '@/components/modals/ColorModal';

import ProductBasicInfo from './products/components/ProductBasicInfo';
import ProductPricing from './products/components/ProductPricing';
import ProductOptions, { type OptionRow } from './products/components/ProductOptions';
import ProductMedia from './products/components/ProductMedia';
import ProductSidebar from './products/components/ProductSidebar';
import { cn } from "@/lib/utils";

const DEFAULT_OPTIONS: OptionRow[] = [
  { name: 'Size', values: ['S', 'M', 'L', 'XL'], inputVal: '' },
  { name: 'Weight', values: ['10', '20', '30', '40'], inputVal: '' },
];

export default function AddProduct() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const descRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { categories } = useSelector((s: RootState) => s.categories);
  const { brands } = useSelector((s: RootState) => s.brands);
  const { colors } = useSelector((s: RootState) => s.colors);
  const { addLoading, addSuccess, addError } = useSelector((s: RootState) => s.products);

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
  const [tags, setTags] = useState<string[]>(['T-Shirt', 'Main Clothes', 'Summer Collection']);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showColorMdl, setShowColorMdl] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands());
    dispatch(fetchColors());
  }, [dispatch]);

  useEffect(() => {
    setSubCatId('');
  }, [categoryId]);

  useEffect(() => {
    if (addSuccess) {
      dispatch(clearAddSuccess());
      navigate('/products');
      dispatch(fetchProducts({ pageNumber: 1, pageSize: 12 }));
    }
  }, [addSuccess, dispatch, navigate]);

  useEffect(() => {
    if (addError === 'Access denied: Admin role required') {
      toast.error('Access denied: Admin role required');
    }
  }, [addError]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!productName.trim()) e.productName = 'Product name is required';
    if (price === '' || Number(price) <= 0) e.price = 'Valid price is required';
    if (!categoryId) e.categoryId = 'Category is required';
    if (!subCatId) e.subCatId = 'Sub-category is required';
    if (!brandId) e.brandId = 'Brand is required';
    if (colorIds.length === 0) e.colorId = 'At least one color is required';
    if (images.length === 0) e.images = 'At least one image is required';
    if (!code.trim()) e.code = 'Product code is required';
    
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error('Please fill in all required fields');
    }
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const description = descRef.current?.innerText ?? '';
    
    const fd = new FormData();
    
    fd.append('ProductName', productName.trim());
    fd.append('Price', String(price));
    
    if (code) fd.append('Code', code.trim());
    if (description) fd.append('Description', description);
    
    if (discount !== '') {
      fd.append('DiscountPrice', String(discount));
      fd.append('HasDiscount', 'true');
    } else {
      fd.append('HasDiscount', 'false');
    }
    
    if (quantity !== '') fd.append('Quantity', String(quantity));
    
    fd.append('CategoryId', String(categoryId || 0));
    fd.append('SubCategoryId', String(subCatId || 0));
    fd.append('ColorId', String(colorIds[0] ?? 0));
    if (brandId) fd.append('BrandId', String(brandId));
    
    const sizeOpt = options.find(o => o.name.toLowerCase() === 'size');
    const weightOpt = options.find(o => o.name.toLowerCase() === 'weight');
    if (sizeOpt?.values.length) fd.append('Size', sizeOpt.values.join(','));
    if (weightOpt?.values.length) fd.append('Weight', weightOpt.values.join(','));

    if (images && images.length > 0) {
      images.forEach((img) => {
        fd.append('Images', img); 
      });
    }

    dispatch(addProduct(fd));
  };

  const execFormat = (cmd: string) => {
    descRef.current?.focus();
    document.execCommand(cmd, false);
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
    setImages(prev => [...prev, ...valid]);
  }, []);

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
            <span className={cn('font-medium', 'text-zinc-900', 'dark:text-white')}>Add new</span>
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
            {addLoading ? <Loader2 size={16} className="animate-spin" /> : null}
            {addLoading ? 'Saving…' : 'Save'}
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
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            handleDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
            handleFiles={handleFiles}
            fileRef={fileRef}
            removeNewImage={(i) => setImages(p => p.filter((_, idx) => idx !== i))}
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

      {showColorMdl && <ColorModal onClose={() => setShowColorMdl(false)} />}
    </div>
  );
}