import React from 'react';
import { Upload, X } from 'lucide-react';
import { getImageUrl, type ProductImage } from '@/store/productsSlice';

interface ProductMediaProps {
  images: File[];
  existingImages?: ProductImage[];
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFiles: (files: FileList | null) => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
  removeNewImage: (index: number) => void;
  removeExistingImage?: (id: number) => void;
}

export default function ProductMedia({
  images, existingImages = [],
  isDragging, setIsDragging,
  handleDrop, handleFiles,
  fileRef,
  removeNewImage, removeExistingImage
}: ProductMediaProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 mb-6">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Media</h3>

      <div
        className={`relative flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed rounded-xl transition-all duration-200 ease-in-out cursor-pointer group ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
            : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:border-zinc-400 dark:hover:border-zinc-500'
        }`}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mb-4 transition-colors">
          <Upload size={24} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <span className="text-indigo-600 dark:text-indigo-400 hover:underline">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          multiple
          accept="image/*"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {(images.length > 0 || existingImages.length > 0) && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-zinc-900 dark:text-white uppercase tracking-wide mb-3">Selected Images</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {existingImages.map(img => (
              <div key={img.id} className="relative group rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 aspect-square bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <img src={getImageUrl(img.imageUrl)} alt="Existing product" className="w-full h-full object-cover" />
                {removeExistingImage && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeExistingImage(img.id); }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                    title="Remove image"
                  >
                    <X size={14} />
                  </button>
                )}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 text-white text-[10px] font-medium rounded backdrop-blur-sm">
                  Existing
                </div>
              </div>
            ))}
            
            {images.map((f, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 aspect-square bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <img src={URL.createObjectURL(f)} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeNewImage(i); }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                  title="Remove image"
                >
                  <X size={14} />
                </button>
                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-indigo-500/80 text-white text-[10px] font-medium rounded backdrop-blur-sm">
                  New
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
