import React, { type RefObject } from 'react';
import { Bold, Italic, Underline, List, AlignLeft } from 'lucide-react';
import type { Category } from '@/store/categoriesSlice';
import type { Brand } from '@/store/brandsSlice';
import { cn } from '@/lib/utils';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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
  codeError?: string;
  categoryIdError?: string;
  subCatIdError?: string;
  brandIdError?: string;
}

export default function ProductBasicInfo({
  productName, setProductName, productNameError,
  code, setCode,
  descRef, execFormat,
  categoryId, setCategoryId,
  subCatId, setSubCatId,
  brandId, setBrandId,
  categories, subCategories, brands,
  descriptionHtml,
  codeError, categoryIdError, subCatIdError, brandIdError,
}: ProductBasicInfoProps) {

  React.useEffect(() => {
    if (descriptionHtml && descRef.current && descRef.current.innerHTML === '') {
      descRef.current.innerHTML = descriptionHtml;
    }
  }, [descriptionHtml, descRef]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 mb-6">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Information</h3>

      {/* Name + Code */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <input
            className={cn(
              'w-full rounded-lg border px-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-2 transition-all',
              productNameError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : 'border-zinc-200 dark:border-zinc-700 focus:border-indigo-500 focus:ring-indigo-500/20'
            )}
            placeholder="Product name"
            value={productName}
            onChange={e => setProductName(e.target.value)}
          />
          {productNameError && <span className="text-xs text-red-500 mt-1.5 block">{productNameError}</span>}
        </div>
        <div className="sm:w-1/3">
          <input
            className={cn(
              'w-full rounded-lg border px-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-2 transition-all',
              codeError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : 'border-zinc-200 dark:border-zinc-700 focus:border-indigo-500 focus:ring-indigo-500/20'
            )}
            placeholder="Code"
            value={code}
            onChange={e => setCode(e.target.value)}
          />
          {codeError && <span className="text-xs text-red-500 mt-1.5 block">{codeError}</span>}
        </div>
      </div>

      {/* Rich text editor */}
      <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden mb-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          {/* Block format */}
          <select
            className="text-sm border-none bg-transparent text-zinc-700 dark:text-zinc-300 font-medium cursor-pointer outline-none pr-1"
            onChange={e => document.execCommand('formatBlock', false, e.target.value)}
            defaultValue="p"
          >
            <option value="p">Normal</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
          </select>

          <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />

          {/* Text formatting toggle group */}
          <ToggleGroup type="multiple" className="gap-0.5">
            <ToggleGroupItem
              value="bold"
              size="sm"
              onClick={() => execFormat('bold')}
              className="h-7 w-7 data-[state=on]:bg-zinc-100 dark:data-[state=on]:bg-zinc-800"
            >
              <Bold size={14} />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="italic"
              size="sm"
              onClick={() => execFormat('italic')}
              className="h-7 w-7 data-[state=on]:bg-zinc-100 dark:data-[state=on]:bg-zinc-800"
            >
              <Italic size={14} />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="underline"
              size="sm"
              onClick={() => execFormat('underline')}
              className="h-7 w-7 data-[state=on]:bg-zinc-100 dark:data-[state=on]:bg-zinc-800"
            >
              <Underline size={14} />
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />

          {/* List + Align */}
          <ToggleGroup type="single" className="gap-0.5">
            <ToggleGroupItem
              value="list"
              size="sm"
              onClick={() => execFormat('insertUnorderedList')}
              className="h-7 w-7"
            >
              <List size={14} />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="align"
              size="sm"
              onClick={() => execFormat('justifyLeft')}
              className="h-7 w-7"
            >
              <AlignLeft size={14} />
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />

          {/* Clear format */}
          <Toggle
            size="sm"
            onClick={() => execFormat('removeFormat')}
            className="h-7 px-2 text-xs font-bold text-zinc-500"
          >
            Tx
          </Toggle>
        </div>

        {/* Editor area */}
        <div
          ref={descRef}
          className="p-4 min-h-[140px] max-h-[300px] overflow-y-auto text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none bg-zinc-50 dark:bg-zinc-950"
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Description"
        />
      </div>

      {/* Category / SubCategory / Brand */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <select
            className={cn(
              'w-full rounded-lg border px-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-2',
              categoryIdError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : 'border-zinc-200 dark:border-zinc-700 focus:border-indigo-500 focus:ring-indigo-500/20'
            )}
            value={categoryId}
            onChange={e => setCategoryId(Number(e.target.value) || '')}
          >
            <option value="">Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
          </select>
          {categoryIdError && <span className="text-xs text-red-500 mt-1.5 block">{categoryIdError}</span>}
        </div>

        <div>
          <select
            className={cn(
              'w-full rounded-lg border px-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-2 disabled:opacity-50',
              subCatIdError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : 'border-zinc-200 dark:border-zinc-700 focus:border-indigo-500 focus:ring-indigo-500/20'
            )}
            value={subCatId}
            onChange={e => setSubCatId(Number(e.target.value) || '')}
            disabled={!categoryId}
          >
            <option value="">Sub-category</option>
            {subCategories.map(s => <option key={s.id} value={s.id}>{s.subCategoryName}</option>)}
          </select>
          {subCatIdError && <span className="text-xs text-red-500 mt-1.5 block">{subCatIdError}</span>}
        </div>

        <div>
          <select
            className={cn(
              'w-full rounded-lg border px-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-2',
              brandIdError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : 'border-zinc-200 dark:border-zinc-700 focus:border-indigo-500 focus:ring-indigo-500/20'
            )}
            value={brandId}
            onChange={e => setBrandId(Number(e.target.value) || '')}
          >
            <option value="">Brands</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.brandName}</option>)}
          </select>
          {brandIdError && <span className="text-xs text-red-500 mt-1.5 block">{brandIdError}</span>}
        </div>
      </div>
    </div>
  );
}
