import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Plus, Search, Pencil, X, Loader2, AlertCircle,
  Smartphone, Monitor, Watch, Headphones, Camera,
  Gamepad2, Shirt, ShoppingBag, Tag, Tv, Cpu,
  Upload, Trash2, Clock, ChevronDown
} from 'lucide-react';

import type { AppDispatch, RootState } from '@/store';
import { fetchBrands, addBrand, updateBrand, deleteBrand, clearAddError, clearEditError as clearBrandEditError } from '@/store/brandsSlice';
import {
  fetchCategories, addCategory, updateCategory, deleteCategory,
  addSubCategory, updateSubCategory, deleteSubCategory,
  clearAddError as clearCatAddError, clearEditError as clearCatEditError,
  clearSubCatAddError, clearSubCatEditError,
} from '@/store/categoriesSlice';
import { getImageUrl } from '@/store/productsSlice';
import { cn } from "@/lib/utils";

type Tab = 'categories' | 'brands' | 'subcategories' | 'banners';

const BRAND_ICONS = [Smartphone, Monitor, Watch, Headphones, Camera, Gamepad2, Shirt, ShoppingBag, Tag, Tv, Cpu];

function getIcon(name: string, size = 36) {
  const n = name.toLowerCase();
  if (n.includes('phone') || n.includes('mobile'))       return <Smartphone size={size} strokeWidth={1.5} />;
  if (n.includes('computer') || n.includes('laptop'))    return <Monitor size={size} strokeWidth={1.5} />;
  if (n.includes('watch'))                               return <Watch size={size} strokeWidth={1.5} />;
  if (n.includes('head') || n.includes('audio'))        return <Headphones size={size} strokeWidth={1.5} />;
  if (n.includes('camera'))                              return <Camera size={size} strokeWidth={1.5} />;
  if (n.includes('game') || n.includes('gaming'))       return <Gamepad2 size={size} strokeWidth={1.5} />;
  if (n.includes('tv') || n.includes('television'))     return <Tv size={size} strokeWidth={1.5} />;
  if (n.includes('cpu') || n.includes('chip'))          return <Cpu size={size} strokeWidth={1.5} />;
  if (n.includes('shirt') || n.includes('cloth'))       return <Shirt size={size} strokeWidth={1.5} />;
  
  const idx = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % BRAND_ICONS.length;
  const Icon = BRAND_ICONS[idx];
  return <Icon size={size} strokeWidth={1.5} />;
}

interface CategoryModalProps {
  mode: 'add' | 'edit';
  initial?: { id: number; categoryName: string };
  onClose: () => void;
}

function CategoryModal({ mode, initial, onClose }: CategoryModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { addLoading, addError, editLoading, editError } = useSelector((s: RootState) => s.categories);
  const [name, setName] = useState(initial?.categoryName ?? '');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    dispatch(clearCatAddError());
    dispatch(clearCatEditError());
  }, [dispatch]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const loading = mode === 'add' ? addLoading : editLoading;
  const error   = mode === 'add' ? addError   : editError;

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const formData = new FormData();
    formData.append('CategoryName', name.trim());
    if (file) {
      formData.append('CategoryImage', file);
    }
    
    let result;
    if (mode === 'add') {
      result = await dispatch(addCategory(formData));
    } else {
      formData.append('Id', String(initial!.id));
      result = await dispatch(updateCategory(formData));
    }
    if ((mode === 'add' ? addCategory : updateCategory).fulfilled.match(result)) {
      onClose();
    }
  };

  return (
    <div className={cn('fixed', 'inset-0', 'z-50', 'flex', 'items-center', 'justify-center', 'p-4', 'bg-black/40', 'backdrop-blur-sm')} onClick={onClose}>
      <div
        className={cn('bg-white', 'dark:bg-zinc-900', 'rounded-2xl', 'shadow-xl', 'w-full', 'max-w-lg', 'border', 'border-zinc-200', 'dark:border-zinc-800', 'overflow-hidden')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={cn('flex', 'items-center', 'justify-between', 'px-6', 'py-5', 'border-b', 'border-zinc-100', 'dark:border-zinc-800')}>
          <h3 className={cn('font-bold', 'text-zinc-900', 'dark:text-white', 'text-[15px]')}>
            {mode === 'add' ? 'Add category' : 'Edit category'}
          </h3>
          <button onClick={onClose} className={cn('text-zinc-400', 'hover:text-zinc-600', 'dark:hover:text-zinc-300', 'transition-colors', 'p-1', 'rounded-md', 'hover:bg-zinc-100', 'dark:hover:bg-zinc-800')}>
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className={cn('p-6', 'space-y-4')}>
          {error && (
            <div className={cn('flex', 'items-center', 'gap-2', 'p-3', 'bg-red-50', 'dark:bg-red-500/10', 'border', 'border-red-200', 'dark:border-red-500/20', 'rounded-lg', 'text-sm', 'text-red-600', 'dark:text-red-400')}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div>
             <label className={cn('block', 'text-xs', 'font-semibold', 'text-zinc-500', 'dark:text-zinc-400', 'mb-1.5', 'uppercase', 'tracking-wide')}>
               Category Name
             </label>
            <input
              autoFocus
              type="text"
              placeholder="Category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn('w-full', 'rounded-lg', 'border', 'border-zinc-200', 'dark:border-zinc-700', 'px-4', 'py-2.5', 'text-sm', 'bg-zinc-50', 'dark:bg-zinc-950', 'dark:text-white', 'focus:outline-none', 'focus:ring-2', 'focus:border-blue-500', 'focus:ring-blue-500/20', 'transition-all')}
            />
          </div>

          <label className={cn('border-2', 'border-dashed', 'border-zinc-200', 'dark:border-zinc-700', 'rounded-xl', 'p-8', 'flex', 'flex-col', 'items-center', 'justify-center', 'text-center', 'cursor-pointer', 'hover:bg-zinc-50', 'dark:hover:bg-zinc-800/50', 'transition-colors', 'relative')}>
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/gif, image/svg+xml" 
              className={cn('absolute', 'inset-0', 'w-full', 'h-full', 'opacity-0', 'cursor-pointer')}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <div className={cn('h-10', 'w-10', 'bg-zinc-100', 'dark:bg-zinc-800', 'rounded-full', 'flex', 'items-center', 'justify-center', 'mb-3')}>
              <Upload size={18} className={cn('text-zinc-900', 'dark:text-zinc-100', 'stroke-[2.5]')} />
            </div>
            {file ? (
              <p className={cn('text-sm', 'font-semibold', 'text-zinc-900', 'dark:text-zinc-100', 'mb-1')}>{file.name}</p>
            ) : (
              <>
                <p className={cn('text-sm', 'font-semibold', 'text-zinc-900', 'dark:text-zinc-100', 'mb-1')}>
                  <span className={cn('underline', 'decoration-zinc-400', 'underline-offset-2')}>Click to upload</span> or drag and drop
                </p>
                <p className={cn('text-[13px]', 'text-zinc-500', 'dark:text-zinc-400')}>
                  (SVG, JPG, PNG, or gif maximum 900x400)
                </p>
              </>
            )}
          </label>
        </div>

        <div className={cn('flex', 'items-center', 'justify-end', 'gap-3', 'px-6', 'py-4', 'bg-zinc-50', 'dark:bg-zinc-950/50', 'border-t', 'border-zinc-100', 'dark:border-zinc-800')}>
          <button
            onClick={onClose}
            disabled={loading}
            className={cn('px-5', 'py-2', 'text-sm', 'font-medium', 'text-zinc-700', 'dark:text-zinc-300', 'bg-white', 'dark:bg-zinc-800', 'border', 'border-zinc-200', 'dark:border-zinc-700', 'rounded-lg', 'hover:bg-zinc-50', 'dark:hover:bg-zinc-700', 'transition-colors', 'disabled:opacity-50')}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className={cn('flex', 'items-center', 'gap-2', 'px-5', 'py-2', 'text-sm', 'font-medium', 'text-white', 'bg-blue-600', 'rounded-lg', 'hover:bg-blue-700', 'transition-colors', 'disabled:opacity-60')}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {mode === 'add' ? 'Create' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface SubCatFormPanelProps {
  editTarget: { id: number; subCategoryName: string; categoryId: number } | null;
  categories: { id: number; categoryName: string }[];
  onCancel: () => void;
}

function SubCatFormPanel({ editTarget, categories, onCancel }: SubCatFormPanelProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { subCatAddLoading, subCatAddError, subCatEditLoading, subCatEditError } = useSelector((s: RootState) => s.categories);
  const [name, setName] = useState('');
  const [catId, setCatId] = useState<number | ''>('');

  useEffect(() => {
    if (editTarget) {
      setName(editTarget.subCategoryName);
      setCatId(editTarget.categoryId);
    } else {
      setName('');
      setCatId('');
    }
    dispatch(clearSubCatAddError());
    dispatch(clearSubCatEditError());
  }, [editTarget, dispatch]);

  const mode = editTarget ? 'edit' : 'add';
  const loading = mode === 'add' ? subCatAddLoading : subCatEditLoading;
  const error   = mode === 'add' ? subCatAddError   : subCatEditError;

  const handleSubmit = async () => {
    if (!name.trim() || !catId) return;
    let result;
    if (mode === 'add') {
      result = await dispatch(addSubCategory({ SubCategoryName: name.trim(), CategoryId: Number(catId) }));
      if (addSubCategory.fulfilled.match(result)) { setName(''); setCatId(''); }
    } else {
      result = await dispatch(updateSubCategory({ Id: editTarget!.id, SubCategoryName: name.trim(), CategoryId: Number(catId) }));
      if (updateSubCategory.fulfilled.match(result)) onCancel();
    }
  };

  return (
    <div className={cn('bg-white', 'dark:bg-zinc-900', 'border', 'border-zinc-200', 'dark:border-zinc-800', 'rounded-xl', 'p-6', 'shadow-sm')}>
      <h3 className={cn('font-bold', 'text-zinc-900', 'dark:text-white', 'text-lg', 'mb-6')}>
        {mode === 'add' ? 'Add new subcategory' : 'Edit subcategory'}
      </h3>

      {error && (
        <div className={cn('flex', 'items-center', 'gap-2', 'p-3', 'mb-4', 'bg-red-50', 'dark:bg-red-500/10', 'border', 'border-red-200', 'dark:border-red-500/20', 'rounded-lg', 'text-sm', 'text-red-600', 'dark:text-red-400')}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder="Subcategory name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
        className={cn('w-full', 'rounded-lg', 'border', 'border-zinc-200', 'dark:border-zinc-700', 'px-4', 'py-3', 'text-[14px]', 'bg-white', 'dark:bg-zinc-950', 'dark:text-white', 'focus:outline-none', 'focus:ring-2', 'focus:border-blue-500', 'transition-all', 'mb-4', 'placeholder:text-zinc-400')}
      />

      <select
        value={catId}
        onChange={(e) => setCatId(Number(e.target.value) || '')}
        className={cn('w-full', 'rounded-lg', 'border', 'border-zinc-200', 'dark:border-zinc-700', 'px-4', 'py-3', 'text-[14px]', 'bg-white', 'dark:bg-zinc-950', 'dark:text-white', 'focus:outline-none', 'focus:ring-2', 'focus:border-blue-500', 'transition-all', 'mb-6')}
      >
        <option value="">Select category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.categoryName}</option>
        ))}
      </select>

      <div className={cn('flex', 'justify-end', 'gap-3')}>
        {mode === 'edit' && (
          <button
            onClick={onCancel}
            className={cn('px-6', 'py-2.5', 'text-sm', 'font-medium', 'text-zinc-700', 'dark:text-zinc-300', 'bg-zinc-100', 'dark:bg-zinc-800', 'rounded-lg', 'hover:bg-zinc-200', 'dark:hover:bg-zinc-700', 'transition-colors')}
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading || !name.trim() || !catId}
          className={cn('flex', 'items-center', 'gap-2', 'px-8', 'py-2', 'text-sm', 'font-medium', 'text-white', 'bg-[#2563eb]', 'rounded-lg', 'hover:bg-blue-700', 'transition-colors', 'disabled:opacity-60', 'shadow-sm')}
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {mode === 'add' ? 'Create' : 'Save'}
        </button>
      </div>
    </div>
  );
}

interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
}

function BannerUploadBlock({ title, hasCategories, hasTimer }: { title: string; hasCategories?: boolean; hasTimer?: boolean }) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [subtitle, setSubtitle] = useState('Enhance Your Music Experience');
  const [bannerTitle, setBannerTitle] = useState('Enhance Your Music Experience');
  const [timer, setTimer] = useState('05d/23h/59m/35s');
  const [selectedCategory, setSelectedCategory] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { categories } = useSelector((s: RootState) => s.categories);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter(f => f.type.startsWith('image/')).map(f => ({
      id: `${Date.now()}-${Math.random()}`,
      file: f,
      previewUrl: URL.createObjectURL(f),
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => {
      const item = prev.find(f => f.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter(f => f.id !== id);
    });
  };

  return (
    <div className={cn('flex', 'flex-col')}>
      <h3 className={cn('font-bold', 'text-zinc-900', 'dark:text-white', 'text-[17px]', 'mb-4')}>{title}</h3>

      <label
        className={cn('border-2', 'border-dashed', 'border-zinc-200', 'dark:border-zinc-700', 'rounded-xl', 'p-8', 'flex', 'flex-col', 'items-center', 'justify-center', 'text-center', 'cursor-pointer', 'hover:bg-zinc-50', 'dark:hover:bg-zinc-800/50', 'transition-colors', 'mb-4')}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className={cn('h-10', 'w-10', 'bg-zinc-100', 'dark:bg-zinc-800', 'rounded-full', 'flex', 'items-center', 'justify-center', 'mb-3')}>
          <Upload size={18} className={cn('text-zinc-900', 'dark:text-zinc-100', 'stroke-[2.5]')} />
        </div>
        <p className={cn('text-sm', 'font-semibold', 'text-zinc-900', 'dark:text-zinc-100', 'mb-1')}>
          <span className={cn('underline', 'decoration-zinc-400', 'underline-offset-2')}>Click to upload</span> or drag and drop
        </p>
        <p className={cn('text-[13px]', 'text-zinc-500', 'dark:text-zinc-400')}>
          (SVG, JPG, PNG, or gif maximum 900x400)
        </p>
      </label>

      <div className={cn('border', 'border-zinc-200', 'dark:border-zinc-800', 'rounded-xl', 'overflow-hidden', 'mb-6')}>
        <table className={cn('w-full', 'text-left', 'text-[13px]')}>
          <thead className={cn('bg-zinc-50', 'dark:bg-zinc-900/50', 'text-zinc-500', 'dark:text-zinc-400')}>
            <tr>
              <th className={cn('px-4', 'py-3.5', 'w-20', 'font-medium')}>Image</th>
              <th className={cn('px-4', 'py-3.5', 'font-medium')}>File name</th>
              <th className={cn('px-4', 'py-3.5', 'text-right', 'font-medium')}>Action</th>
            </tr>
          </thead>
          <tbody className={cn('divide-y', 'divide-zinc-200', 'dark:divide-zinc-800')}>
            {uploadedFiles.length === 0 ? (
              <tr>
                <td colSpan={3} className={cn('px-4', 'py-6', 'text-center', 'text-zinc-400', 'dark:text-zinc-600', 'text-sm')}>
                  No files uploaded yet
                </td>
              </tr>
            ) : (
              uploadedFiles.map((item) => (
                <tr key={item.id} className={cn('bg-white', 'dark:bg-zinc-950')}>
                  <td className={cn('px-4', 'py-3')}>
                    <div className={cn('w-14', 'h-14', 'rounded-lg', 'border', 'border-zinc-200', 'dark:border-zinc-800', 'overflow-hidden', 'bg-zinc-100', 'dark:bg-zinc-800')}>
                      <img src={item.previewUrl} alt={item.file.name} className={cn('w-full', 'h-full', 'object-cover')} />
                    </div>
                  </td>
                  <td className={cn('px-4', 'py-3', 'text-zinc-900', 'dark:text-zinc-200', 'font-semibold', 'truncate', 'max-w-[180px]')}>
                    {item.file.name}
                  </td>
                  <td className={cn('px-4', 'py-3', 'text-right')}>
                    <button
                      onClick={() => removeFile(item.id)}
                      className={cn('text-zinc-400', 'hover:text-red-500', 'transition-colors', 'p-1.5', 'rounded', 'hover:bg-red-50', 'dark:hover:bg-red-500/10', 'inline-flex', 'items-center', 'justify-center')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={cn('border', 'border-zinc-200', 'dark:border-zinc-800', 'rounded-xl', 'p-6', 'bg-white', 'dark:bg-zinc-950', 'space-y-5')}>
        {hasCategories && (
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={cn('w-full', 'appearance-none', 'rounded-lg', 'border', 'border-zinc-200', 'dark:border-zinc-700', 'px-4', 'py-3', 'text-sm', 'bg-white', 'dark:bg-zinc-950', 'text-zinc-700', 'dark:text-zinc-300', 'focus:outline-none', 'focus:ring-2', 'focus:border-blue-500')}
            >
              <option value="">Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
              ))}
            </select>
            <ChevronDown size={16} className={cn('absolute', 'right-4', 'top-1/2', '-translate-y-1/2', 'text-zinc-400', 'pointer-events-none')} />
          </div>
        )}

        {hasTimer && (
          <div className="relative">
            <input
              type="text"
              value={timer}
              onChange={(e) => setTimer(e.target.value)}
              className={cn('w-full', 'rounded-lg', 'border', 'border-zinc-200', 'dark:border-zinc-700', 'px-4', 'py-3', 'text-sm', 'bg-white', 'dark:bg-zinc-950', 'dark:text-white', 'focus:outline-none', 'focus:ring-2', 'focus:border-blue-500', 'font-medium')}
            />
            <Clock size={16} className={cn('absolute', 'right-4', 'top-1/2', '-translate-y-1/2', 'text-zinc-400')} />
          </div>
        )}

        {!hasCategories && (
          <div className={cn('relative', 'pt-2')}>
            <label className={cn('absolute', 'top-0', 'left-3', 'bg-white', 'dark:bg-zinc-950', 'px-1', 'text-[11px]', 'font-medium', 'text-zinc-400')}>Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className={cn('w-full', 'rounded-lg', 'border', 'border-zinc-200', 'dark:border-zinc-700', 'px-4', 'py-3', 'text-[14px]', 'font-medium', 'bg-white', 'dark:bg-zinc-950', 'dark:text-white', 'focus:outline-none', 'focus:ring-2', 'focus:border-blue-500')}
            />
          </div>
        )}

        <div className={cn('relative', 'pt-2')}>
          <label className={cn('absolute', 'top-0', 'left-3', 'bg-white', 'dark:bg-zinc-950', 'px-1', 'text-[11px]', 'font-medium', 'text-zinc-400')}>Title</label>
          <input
            type="text"
            value={bannerTitle}
            onChange={(e) => setBannerTitle(e.target.value)}
            className={cn('w-full', 'rounded-lg', 'border', 'border-zinc-200', 'dark:border-zinc-700', 'px-4', 'py-3', 'text-[14px]', 'font-medium', 'bg-white', 'dark:bg-zinc-950', 'dark:text-white', 'focus:outline-none', 'focus:ring-2', 'focus:border-blue-500')}
          />
        </div>

        <div className={cn('flex', 'justify-end', 'pt-2')}>
          <button
            onClick={() => console.log('Save banner', { uploadedFiles, subtitle, bannerTitle, timer, selectedCategory })}
            className={cn('px-8', 'py-2.5', 'text-sm', 'font-medium', 'text-white', 'bg-[#2563eb]', 'rounded-lg', 'hover:bg-blue-700', 'transition-colors', 'shadow-sm')}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

interface BrandFormPanelProps {
  editTarget: { id: number; name: string } | null;
  onCancel: () => void;
}

function BrandFormPanel({ editTarget, onCancel }: BrandFormPanelProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { addLoading, addError, editLoading, editError } = useSelector((s: RootState) => s.brands);
  const [name, setName] = useState('');

  useEffect(() => {
    if (editTarget) setName(editTarget.name);
    else setName('');
    dispatch(clearAddError());
    dispatch(clearBrandEditError());
  }, [editTarget, dispatch]);

  const mode = editTarget ? 'edit' : 'add';
  const loading = mode === 'add' ? addLoading : editLoading;
  const error = mode === 'add' ? addError : editError;

  const handleSubmit = async () => {
    if (!name.trim()) return;
    let result;
    if (mode === 'add') {
      result = await dispatch(addBrand(name.trim()));
      if (addBrand.fulfilled.match(result)) setName('');
    } else {
      result = await dispatch(updateBrand({ id: editTarget!.id, brandName: name.trim() }));
      if (updateBrand.fulfilled.match(result)) onCancel();
    }
  };

  return (
    <div className={cn('bg-white', 'dark:bg-zinc-900', 'border', 'border-zinc-200', 'dark:border-zinc-800', 'rounded-xl', 'p-6', 'shadow-sm')}>
      <h3 className={cn('font-bold', 'text-zinc-900', 'dark:text-white', 'text-lg', 'mb-6')}>
        {mode === 'add' ? 'Add new brand' : 'Edit brand'}
      </h3>

      {error && (
        <div className={cn('flex', 'items-center', 'gap-2', 'p-3', 'mb-4', 'bg-red-50', 'dark:bg-red-500/10', 'border', 'border-red-200', 'dark:border-red-500/20', 'rounded-lg', 'text-sm', 'text-red-600', 'dark:text-red-400')}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder="Brand name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
        className={cn('w-full', 'rounded-lg', 'border', 'border-zinc-200', 'dark:border-zinc-700', 'px-4', 'py-3', 'text-[14px]', 'bg-white', 'dark:bg-zinc-950', 'dark:text-white', 'focus:outline-none', 'focus:ring-2', 'focus:border-blue-500', 'transition-all', 'mb-6', 'placeholder:text-zinc-400')}
      />

      <div className={cn('flex', 'justify-end', 'gap-3')}>
        {mode === 'edit' && (
          <button
            onClick={onCancel}
            className={cn('px-6', 'py-2.5', 'text-sm', 'font-medium', 'text-zinc-700', 'dark:text-zinc-300', 'bg-zinc-100', 'dark:bg-zinc-800', 'rounded-lg', 'hover:bg-zinc-200', 'dark:hover:bg-zinc-700', 'transition-colors')}
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading || !name.trim()}
          className={cn('flex', 'items-center', 'gap-2', 'px-8', 'py-2', 'text-sm', 'font-medium', 'text-white', 'bg-[#2563eb]', 'rounded-lg', 'hover:bg-blue-700', 'transition-colors', 'disabled:opacity-60', 'shadow-sm')}
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {mode === 'add' ? 'Create' : 'Save'}
        </button>
      </div>
    </div>
  );
}

// ИСЛОҲОТ: Илова кардани `image` ба Props ва истифода аз он
interface ItemCardProps {
  name: string;
  image?: string | null;
  onEdit: () => void;
  onDelete?: () => void;
}

function ItemCard({ name, image, onEdit, onDelete }: ItemCardProps) {
  return (
    <div className={cn('relative', 'bg-white', 'dark:bg-zinc-900', 'border', 'border-zinc-200', 'dark:border-zinc-800', 'rounded-xl', 'p-5', 'flex', 'flex-col', 'items-center', 'justify-center', 'gap-3', 'min-h-[120px]', 'hover:shadow-sm', 'transition-shadow', 'group')}>
      <div className={cn('absolute', 'top-2.5', 'right-2.5', 'flex', 'items-center', 'gap-1', 'opacity-0', 'group-hover:opacity-100', 'focus-within:opacity-100', 'transition-opacity')}>
        <button
          onClick={onEdit}
          className={cn('p-1.5', 'text-blue-500', 'hover:text-blue-700', 'hover:bg-blue-50', 'dark:hover:bg-blue-500/10', 'rounded', 'transition-colors')}
        >
          <Pencil size={14} strokeWidth={2} />
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className={cn('p-1.5', 'text-red-500', 'hover:text-red-700', 'hover:bg-red-50', 'dark:hover:bg-red-500/10', 'rounded', 'transition-colors')}
          >
            <Trash2 size={14} strokeWidth={2} />
          </button>
        )}
      </div>
      
      <div className={cn('w-12', 'h-12', 'rounded-xl', 'flex', 'items-center', 'justify-center', 'bg-zinc-100', 'dark:bg-zinc-800', 'text-zinc-600', 'dark:text-zinc-300', 'overflow-hidden')}>
        {image ? (
          <img src={getImageUrl(image)} alt={name} className={cn('w-full', 'h-full', 'object-contain', 'p-1')} />
        ) : (
          getIcon(name, 24)
        )}
      </div>
      
      <p className={cn('text-sm', 'font-medium', 'text-zinc-700', 'dark:text-zinc-300', 'text-center', 'leading-tight')}>
        {name}
      </p>
    </div>
  );
}

export default function Other() {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const { brands, loading: brandsLoading } = useSelector((s: RootState) => s.brands);
  const { categories, loading: catLoading } = useSelector((s: RootState) => s.categories);

  const [tab, setTab] = useState<Tab>('categories');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<{ id: number; name: string; type: 'brand' | 'category' } | null>(null);
  const [subCatEditTarget, setSubCatEditTarget] = useState<{ id: number; subCategoryName: string; categoryId: number } | null>(null);

  useEffect(() => {
    dispatch(fetchBrands());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => { setSearch(''); setEditTarget(null); setSubCatEditTarget(null); }, [tab]);

  const filteredBrands = tab === 'brands'
    ? brands.filter((b) => b.brandName.toLowerCase().includes(search.toLowerCase()))
    : [];

  const filteredCategories = tab === 'categories'
    ? categories.filter((c) => c.categoryName.toLowerCase().includes(search.toLowerCase()))
    : [];

  const allSubCategories = categories.flatMap((cat) =>
    (cat.subCategories ?? []).map((s) => ({ ...s, categoryName: cat.categoryName }))
  );
  const filteredSubCats = tab === 'subcategories'
    ? allSubCategories.filter((s) =>
        s.subCategoryName.toLowerCase().includes(search.toLowerCase()) ||
        s.categoryName.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const isLoading = tab === 'brands' ? brandsLoading : catLoading;

  const TAB_LABELS: Record<Tab, string> = {
    categories: t('other.categories'),
    brands: t('other.brands'),
    subcategories: 'Subcategories',
    banners: t('other.banners'),
  };

  return (
    <div className={cn('flex', 'flex-col', 'h-full', 'max-w-6xl', 'mx-auto')}>
      <div className={cn('flex', 'items-center', 'justify-between', 'mb-6')}>
        <div className={cn('flex', 'items-center', 'gap-1', 'bg-white', 'dark:bg-zinc-900', 'border', 'border-zinc-200', 'dark:border-zinc-800', 'rounded-xl', 'p-1', 'shadow-sm')}>
          {(['categories', 'brands', 'subcategories', 'banners'] as Tab[]).map((t_) => (
            <button
              key={t_}
              onClick={() => setTab(t_)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                tab === t_
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {TAB_LABELS[t_]}
            </button>
          ))}
        </div>

        {tab === 'categories' && (
          <button
            onClick={() => setShowAddModal(true)}
            className={cn('flex', 'items-center', 'gap-2', 'px-4', 'py-2', 'bg-blue-600', 'hover:bg-blue-700', 'text-white', 'rounded-lg', 'font-medium', 'text-sm', 'transition-colors', 'shadow-sm')}
          >
            <Plus size={16} />
            {t('other.addNew')}
          </button>
        )}
      </div>

      {(tab === 'categories' || tab === 'subcategories') && (
        <div className={cn('relative', 'w-72', 'mb-6')}>
          <Search size={15} className={cn('absolute', 'left-3', 'top-1/2', '-translate-y-1/2', 'text-zinc-400')} />
          <input
            type="text"
            placeholder={t('common.search') + '...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn('w-full', 'pl-9', 'pr-4', 'py-2', 'text-sm', 'bg-white', 'dark:bg-zinc-900', 'border', 'border-zinc-200', 'dark:border-zinc-800', 'rounded-lg', 'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500/20', 'focus:border-blue-500', 'dark:text-white', 'transition-all')}
          />
        </div>
      )}

      {tab === 'brands' ? (
        <div className={cn('grid', 'grid-cols-1', 'md:grid-cols-[1fr_450px]', 'gap-8', 'mt-2')}>
          <div>
            <div className={cn('flex', 'items-center', 'justify-between', 'text-[13px]', 'font-semibold', 'text-zinc-500', 'dark:text-zinc-400', 'pb-3', 'border-b', 'border-zinc-200', 'dark:border-zinc-800')}>
              <span>Brands</span>
              <span>Action</span>
            </div>
            {brandsLoading ? (
              <div className={cn('flex', 'justify-center', 'py-16')}><Loader2 className={cn('animate-spin', 'text-blue-500')} /></div>
            ) : filteredBrands.length === 0 ? (
              <div className={cn('flex', 'justify-center', 'py-16', 'text-zinc-400')}>No brands found</div>
            ) : (
              <div className={cn('flex', 'flex-col')}>
                {filteredBrands.map((item) => (
                  <div key={item.id} className={cn('flex', 'items-center', 'justify-between', 'py-4', 'border-b', 'border-zinc-100', 'dark:border-zinc-800/50')}>
                    <span className={cn('font-bold', 'text-zinc-900', 'dark:text-zinc-100', 'text-[14px]')}>{item.brandName}</span>
                    <div className={cn('flex', 'items-center', 'gap-5')}>
                      <button onClick={() => setEditTarget({ id: item.id, name: item.brandName, type: 'brand' })} className={cn('text-blue-600', 'hover:text-blue-800', 'transition-colors')}>
                        <Pencil size={18} strokeWidth={2.5} />
                      </button>
                      <button onClick={() => { if (confirm('Are you sure you want to delete this brand?')) dispatch(deleteBrand(item.id)); }} className={cn('text-red-500', 'hover:text-red-600', 'transition-colors')}>
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <BrandFormPanel
              editTarget={editTarget?.type === 'brand' ? editTarget : null}
              onCancel={() => setEditTarget(null)}
            />
          </div>
        </div>

      ) : tab === 'subcategories' ? (
        <div className={cn('grid', 'grid-cols-1', 'md:grid-cols-[1fr_450px]', 'gap-8', 'mt-2')}>
          <div>
            <div className={cn('flex', 'items-center', 'justify-between', 'text-[13px]', 'font-semibold', 'text-zinc-500', 'dark:text-zinc-400', 'pb-3', 'border-b', 'border-zinc-200', 'dark:border-zinc-800')}>
              <span>Subcategory</span>
              <span>Action</span>
            </div>
            {catLoading ? (
              <div className={cn('flex', 'justify-center', 'py-16')}><Loader2 className={cn('animate-spin', 'text-blue-500')} /></div>
            ) : filteredSubCats.length === 0 ? (
              <div className={cn('flex', 'justify-center', 'py-16', 'text-zinc-400')}>No subcategories found</div>
            ) : (
              <div className={cn('flex', 'flex-col')}>
                {filteredSubCats.map((item) => (
                  <div key={item.id} className={cn('flex', 'items-center', 'justify-between', 'py-4', 'border-b', 'border-zinc-100', 'dark:border-zinc-800/50')}>
                    <div>
                      <span className={cn('font-bold', 'text-zinc-900', 'dark:text-zinc-100', 'text-[14px]')}>{item.subCategoryName}</span>
                      <span className={cn('ml-2', 'text-xs', 'text-zinc-400', 'dark:text-zinc-500')}>({item.categoryName})</span>
                    </div>
                    <div className={cn('flex', 'items-center', 'gap-5')}>
                      <button
                        onClick={() => setSubCatEditTarget({ id: item.id, subCategoryName: item.subCategoryName, categoryId: item.categoryId })}
                        className={cn('text-blue-600', 'hover:text-blue-800', 'transition-colors')}
                      >
                        <Pencil size={18} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => { if (confirm('Are you sure you want to delete this subcategory?')) dispatch(deleteSubCategory(item.id)); }}
                        className={cn('text-red-500', 'hover:text-red-600', 'transition-colors')}
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <SubCatFormPanel
              editTarget={subCatEditTarget}
              categories={categories}
              onCancel={() => setSubCatEditTarget(null)}
            />
          </div>
        </div>

      ) : tab === 'banners' ? (
        <div className={cn('grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-8', 'mt-4')}>
          <BannerUploadBlock title="Main sliders" />
          <BannerUploadBlock title="Banner" hasCategories hasTimer />
        </div>

      ) : isLoading ? (
        <div className={cn('flex-1', 'flex', 'flex-col', 'items-center', 'justify-center', 'p-16', 'bg-white', 'dark:bg-zinc-900', 'rounded-xl', 'border', 'border-zinc-200', 'dark:border-zinc-800', 'min-h-[300px]')}>
          <Loader2 size={32} className={cn('animate-spin', 'text-blue-500', 'mb-3')} />
          <p className={cn('text-zinc-500', 'text-sm')}>{t('common.loading')}</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className={cn('flex-1', 'flex', 'flex-col', 'items-center', 'justify-center', 'p-16', 'bg-white', 'dark:bg-zinc-900', 'rounded-xl', 'border', 'border-zinc-200', 'dark:border-zinc-800', 'min-h-[300px]')}>
          <p className={cn('text-zinc-400', 'dark:text-zinc-500')}>{t('common.noResults')}</p>
        </div>
      ) : (
        <div className={cn('grid', 'grid-cols-2', 'sm:grid-cols-3', 'md:grid-cols-4', 'lg:grid-cols-5', 'gap-4')}>
          {filteredCategories.map((item: any) => (
            <ItemCard
              key={item.id}
              name={item.categoryName}
              image={item.categoryImage || item.image}
              onEdit={() => setEditTarget({ id: item.id, name: item.categoryName, type: 'category' })}
              onDelete={() => {
                if (!confirm('Are you sure you want to delete this category?')) return;
                dispatch(deleteCategory(item.id));
              }}
            />
          ))}
        </div>
      )}

      {showAddModal && tab === 'categories' && (
        <CategoryModal mode="add" onClose={() => setShowAddModal(false)} />
      )}
      {editTarget && editTarget.type === 'category' && (
        <CategoryModal mode="edit" initial={{ id: editTarget.id, categoryName: editTarget.name }} onClose={() => setEditTarget(null)} />
      )}
    </div>
  );
}