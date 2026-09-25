export default function FormField({
  label,
  id,
  type = 'text',
  placeholder,
  icon: Icon,
  required,
  value,
  onChange,
  rightElement,
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
            strokeWidth={2}
          />
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          className={`w-full rounded-xl border border-slate-300 bg-white py-3 text-sm text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
            Icon ? 'pl-11' : 'pl-4'
          } ${rightElement ? 'pr-11' : 'pr-4'}`}
        />
        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  )
}
