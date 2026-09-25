import { useState } from 'react'
import { CloudUpload, File, X } from 'lucide-react'

export default function FileUpload({ label, accept = '.jpg,.png,.pdf', maxSize = '5MB', file, onFile }) {
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) onFile(dropped)
  }

  const handleSelect = (e) => {
    const selected = e.target.files[0]
    if (selected) onFile(selected)
  }

  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      {file ? (
        <div className="flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50/50 px-4 py-3">
          <File className="h-5 w-5 shrink-0 text-brand-600" />
          <span className="flex-1 truncate text-sm font-medium text-slate-700">
            {file.name}
          </span>
          <button
            type="button"
            onClick={() => onFile(null)}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
            dragOver
              ? 'border-brand-500 bg-brand-50'
              : 'border-slate-300 bg-slate-50 hover:border-brand-400 hover:bg-brand-50/30'
          }`}
        >
          <CloudUpload className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
          <p className="text-sm text-slate-600">
            Click to <span className="font-semibold text-brand-700">upload</span> or drag and drop
          </p>
          <p className="text-xs text-slate-400">
            {accept.replace(/\./g, '').toUpperCase().replace(/,/g, ', ')} — Max {maxSize}
          </p>
          <input
            type="file"
            accept={accept}
            onChange={handleSelect}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </div>
      )}
    </div>
  )
}
