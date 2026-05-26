import React, {type RefObject } from 'react';
import { Bold, Italic, Underline, List, AlignLeft } from 'lucide-react';
import type { Category } from '@/store/categoriesSlice';
import type { Brand } from '@/store/brandsSlice';
import { cn } from "@/lib/utils";

interface ProductBasicInfoProps {
  productName: string;
  setProductName: (v: string) => void;
  productNameError?: string;
  code: string;
  setCode: (v: string) => void;
  descRef: RefObject<HTMLDivElement | null>;
  execFormat: (cmd: string) => void;
  categoryId: number | '';
  setCategoryId: (v: number | '') => void;
  subCatId: number | '';
  setSubCatId: (v: number | '') => void;
  brandId: number | '';
  setBrandId: (v: number | '') => void;
  categories: Category[];
  subCategories: any[];
  brands: Brand[];
  descriptionHtml?: string;
}

export default function ProductBasicInfo({
  productName, setProductName, productNameError,
  code, setCode,
  descRef, execFormat,
  categoryId, setCategoryId,
  subCatId, setSubCatId,
  brandId, setBrandId,
  categories, subCategories, brands,
  descriptionHtml
}: ProductBasicInfoProps) {
  
  React.useEffect(() => {
    if (descriptionHtml && descRef.current && descRef.current.innerHTML === '') {
      descRef.current.innerHTML = descriptionHtml;
    }
  }, [descriptionHtml, descRef]);

  return (
    <div className={cn('bg-white', 'dark:bg-zinc-900', 'rounded-xl', 'border', 'border-zinc-200', 'dark:border-zinc-800', 'shadow-sm', 'p-5', 'sm:p-6', 'mb-6')}>
      <h3 className={cn('text-lg', 'font-semibold', 'text-zinc-900', 'dark:text-white', 'mb-4')}>Information</h3>
      <div className={cn('flex', 'flex-col', 'sm:flex-row', 'gap-4', 'mb-4')}>
        <div className="flex-1">
          <input
            className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-2 transition-all ${
              productNameError 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                : 'border-zinc-200 dark:border-zinc-700 focus:border-indigo-500 focus:ring-indigo-500/20'
            }`}
            placeholder="Product name"
            value={productName}
            onChange={e => setProductName(e.target.value)}
          />
          {productNameError && <span className={cn('text-xs', 'text-red-500', 'mt-1.5', 'block')}>{productNameError}</span>}
        </div>
        <div className="sm:w-1/3">
          <input
            className={cn('w-full', 'rounded-lg', 'border', 'border-zinc-200', 'dark:border-zinc-700', 'px-4', 'py-2.5', 'text-sm', 'bg-zinc-50', 'dark:bg-zinc-950', 'dark:text-white', 'focus:outline-none', 'focus:ring-2', 'focus:border-indigo-500', 'focus:ring-indigo-500/20', 'transition-all')}
            placeholder="Code"
            value={code}
            onChange={e => setCode(e.target.value)}
          />
        </div>
      </div>

      <div className={cn('border', 'border-zinc-200', 'dark:border-zinc-700', 'rounded-lg', 'overflow-hidden', 'mb-4', 'bg-zinc-50', 'dark:bg-zinc-950')}>
        <div className={cn('flex', 'flex-wrap', 'items-center', 'gap-1', 'p-2', 'border-b', 'border-zinc-200', 'dark:border-zinc-700', 'bg-white', 'dark:bg-zinc-900')}>
          <select 
            className={cn('text-sm', 'border-none', 'bg-transparent', 'focus:ring-0', 'text-zinc-700', 'dark:text-zinc-300', 'font-medium', 'cursor-pointer', 'outline-none')}
            onChange={e => document.execCommand('formatBlock', false, e.target.value)}
            defaultValue="p"
          >
            <option value="p">Normal</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
          </select>
          <div className={cn('w-px', 'h-5', 'bg-zinc-200', 'dark:bg-zinc-700', 'mx-1')} />
          <button type="button" className={cn('p-1.5', 'text-zinc-500', 'hover:text-zinc-900', 'hover:bg-zinc-100', 'dark:hover:bg-zinc-800', 'dark:hover:text-white', 'rounded')} onClick={() => execFormat('bold')}><Bold size={15} /></button>
          <button type="button" className={cn('p-1.5', 'text-zinc-500', 'hover:text-zinc-900', 'hover:bg-zinc-100', 'dark:hover:bg-zinc-800', 'dark:hover:text-white', 'rounded')} onClick={() => execFormat('italic')}><Italic size={15} /></button>
          <button type="button" className={cn('p-1.5', 'text-zinc-500', 'hover:text-zinc-900', 'hover:bg-zinc-100', 'dark:hover:bg-zinc-800', 'dark:hover:text-white', 'rounded')} onClick={() => execFormat('underline')}><Underline size={15} /></button>
          <div className={cn('w-px', 'h-5', 'bg-zinc-200', 'dark:bg-zinc-700', 'mx-1')} />
          <button type="button" className={cn('p-1.5', 'text-zinc-500', 'hover:text-zinc-900', 'hover:bg-zinc-100', 'dark:hover:bg-zinc-800', 'dark:hover:text-white', 'rounded')} onClick={() => execFormat('insertUnorderedList')}><List size={15} /></button>
          <button type="button" className={cn('p-1.5', 'text-zinc-500', 'hover:text-zinc-900', 'hover:bg-zinc-100', 'dark:hover:bg-zinc-800', 'dark:hover:text-white', 'rounded')} onClick={() => execFormat('justifyLeft')}><AlignLeft size={15} /></button>
          <div className={cn('w-px', 'h-5', 'bg-zinc-200', 'dark:bg-zinc-700', 'mx-1')} />
          <button type="button" className={cn('p-1.5', 'text-sm', 'font-bold', 'text-zinc-500', 'hover:text-zinc-900', 'hover:bg-zinc-100', 'dark:hover:bg-zinc-800', 'dark:hover:text-white', 'rounded')} onClick={() => execFormat('removeFormat')}>Tx</button>
        </div>
        <div
          ref={descRef}
          className={cn('p-4', 'min-h-[120px]', 'max-h-[300px]', 'overflow-y-auto', 'text-sm', 'text-zinc-700', 'dark:text-zinc-300', 'focus:outline-none')}
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Description"
        />
      </div>

      <div className={cn('grid', 'grid-cols-1', 'sm:grid-cols-3', 'gap-4')}>
        <select
          className={cn('w-full', 'rounded-lg', 'border', 'border-zinc-200', 'dark:border-zinc-700', 'px-4', 'py-2.5', 'text-sm', 'bg-zinc-50', 'dark:bg-zinc-950', 'dark:text-white', 'focus:outline-none', 'focus:ring-2', 'focus:border-indigo-500', 'focus:ring-indigo-500/20')}
          value={categoryId}
          onChange={e => setCategoryId(Number(e.target.value) || '')}
        >
          <option value="">Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
        </select>
        
        <select 
          className={cn('w-full', 'rounded-lg', 'border', 'border-zinc-200', 'dark:border-zinc-700', 'px-4', 'py-2.5', 'text-sm', 'bg-zinc-50', 'dark:bg-zinc-950', 'dark:text-white', 'focus:outline-none', 'focus:ring-2', 'focus:border-indigo-500', 'focus:ring-indigo-500/20', 'disabled:opacity-50')}
          value={subCatId} 
          onChange={e => setSubCatId(Number(e.target.value) || '')}
          disabled={subCategories.length === 0}
        >
          <option value="">Sub-category</option>
          {subCategories.map(s => <option key={s.id} value={s.id}>{s.subCategoryName}</option>)}
        </select>
        
        <select 
          className={cn('w-full', 'rounded-lg', 'border', 'border-zinc-200', 'dark:border-zinc-700', 'px-4', 'py-2.5', 'text-sm', 'bg-zinc-50', 'dark:bg-zinc-950', 'dark:text-white', 'focus:outline-none', 'focus:ring-2', 'focus:border-indigo-500', 'focus:ring-indigo-500/20')}
          value={brandId} 
          onChange={e => setBrandId(Number(e.target.value) || '')}
        >
          <option value="">Brands</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.brandName}</option>)}
        </select>
      </div>
    </div>
  );
}
