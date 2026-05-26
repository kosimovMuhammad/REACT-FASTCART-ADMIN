import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { RootState, AppDispatch } from '@/store';
import { updateProduct, clearAddSuccess, type Product } from '@/store/productsSlice';import { fetchCategories, fetchSubCategories } from '@/store/categoriesSlice';
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

const BASE = 'https://fastcard-1-o23z.onrender.com/api';
const DEFAULT_OPTIONS: OptionRow[] = [];

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const descRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { categories, subCategories } = useSelector((s: RootState) => s.categories);
  const { brands } = useSelector((s: RootState) => s.brands);
  const { colors } = useSelector((s: RootState) => s.colors);
  const { addLoading, addSuccess, addError } = useSelector((s: RootState) => s.products);
  const token = useSelector((s: RootState) => s.auth.token);

  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productName, setProductName] = useState('');
  const [code, setCode] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [subCatId, setSubCatId] = useState<number | ''>('');
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

        // ИСЛОҲИ ХАТОГӢ: Агар бэкэнд массиви сатрҳо (URL) фиристад, онро ба сохтори ProductImage мувофиқ мекунем
        if (data.images && data.images.length > 0) {
          if (typeof data.images[0] === 'string') {
            // Агар сатр бошанд, ба объект табдил медиҳем (ҳамчун ID худи индексро мегирем ё аз URL)
            const mappedImages = (data.images as unknown as string[]).map((imgUrl, index) => ({
              id: index, // ё агар бэкэнд ID-и расмро ҷудогона нафиристад
              imageUrl: imgUrl
            }));
            setExistingImages(mappedImages);
          } else {
            setExistingImages(data.images);
          }
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
    if (categoryId) {
      dispatch(fetchSubCategories(Number(categoryId)));
    }
  }, [categoryId, dispatch]);

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
    if (!categoryId) e.categoryId = 'Category is required';
    
    setErrors(e);
    
    if (Object.keys(e).length > 0) {
      alert("Илтимос, майдонҳои ҳатмиро дуруст пур кунед!");
    }
    
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!id) return;
    if (!validate()) return;
    
    const description = descRef.current?.innerHTML ?? '';
    const fd = new FormData();
    
    fd.append('id', String(id));
    fd.append('productName', productName.trim());
    
    if (code) fd.append('code', code.trim());
    if (description) fd.append('description', description);
    
    fd.append('price', String(price));
    
    if (discount !== '' && Number(discount) > 0) {
      fd.append('discountPrice', String(discount));
      fd.append('hasDiscount', 'true');
    } else {
      fd.append('discountPrice', '0'); 
      fd.append('hasDiscount', 'false');
    }
    
    fd.append('quantity', quantity !== '' ? String(quantity) : '0');
    
    if (categoryId) fd.append('categoryId', String(categoryId));
    if (subCatId) fd.append('subCategoryId', String(subCatId));
    if (brandId) fd.append('brandId', String(brandId));
    if (colorIds.length > 0) fd.append('colorId', String(colorIds[0]));
    
    if (hasOptions) {
      const sizeOpt = options.find(o => o.name.toLowerCase() === 'size');
      const weightOpt = options.find(o => o.name.toLowerCase() === 'weight');
      if (sizeOpt?.values.length) fd.append('size', sizeOpt.values.join(','));
      if (weightOpt?.values.length) fd.append('weight', weightOpt.values.join(','));
    }
    
    if (images && images.length > 0) {
      images.forEach((img) => {
        fd.append('images', img);
      });
    }

    dispatch(updateProduct(fd as any));
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