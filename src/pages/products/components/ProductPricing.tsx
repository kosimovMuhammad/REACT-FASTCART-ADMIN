interface ProductPricingProps {
  price: number | '';
  setPrice: (v: number | '') => void;
  priceError?: string;
  discount: number | '';
  setDiscount: (v: number | '') => void;
  quantity: number | '';
  setQuantity: (v: number | '') => void;
  hasTax: boolean;
  setHasTax: (v: boolean) => void;
}

export default function ProductPricing({
  price, setPrice, priceError,
  discount, setDiscount,
  quantity, setQuantity,
  hasTax, setHasTax
}: ProductPricingProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 mb-6">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Pricing</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Price</label>
          <input
            type="number"
            min={0}
            className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-2 transition-all ${
              priceError 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                : 'border-zinc-200 dark:border-zinc-700 focus:border-indigo-500 focus:ring-indigo-500/20'
            }`}
            placeholder="$0.00"
            value={price}
            onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
          />
          {priceError && <span className="text-xs text-red-500 mt-1.5 block">{priceError}</span>}
        </div>
        
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Discount Price</label>
          <input
            type="number"
            min={0}
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all"
            placeholder="$0.00"
            value={discount}
            onChange={e => setDiscount(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Quantity</label>
          <input
            type="number"
            min={0}
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all"
            placeholder="0"
            value={quantity}
            onChange={e => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer mt-2 w-max group">
        <div 
          className={`relative w-10 h-5 rounded-full transition-colors duration-200 ease-in-out flex-shrink-0 ${hasTax ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}
          onClick={() => setHasTax(!hasTax)}
        >
          <div className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${hasTax ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
          Add tax for this product
        </span>
      </label>
    </div>
  );
}
