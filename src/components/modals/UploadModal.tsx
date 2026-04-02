import { useState, useRef } from 'react'
import { X, Upload, FileText, CheckCircle2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useUiStore } from '@/stores/uiStore'

interface Props {
  type: 'invoice' | 'bill'
}

export function UploadModal({ type }: Props) {
  const { activeModal, closeModal, showToast } = useUiStore()
  const isOpen = activeModal === (type === 'invoice' ? 'upload-invoice' : 'upload-bill')

  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const title = type === 'invoice' ? 'Upload Invoice' : 'Upload Bill'
  const accent = type === 'invoice' ? 'orange' : 'violet'

  function onClose() {
    closeModal()
    setFile(null)
  }

  function handleFile(f: File) {
    setFile(f)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  function handleSubmit() {
    showToast(`${file?.name ?? 'File'} uploaded successfully`, 'success')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center
            ${accent === 'orange' ? 'bg-orange-50 dark:bg-orange-500/10' : 'bg-violet-50 dark:bg-violet-500/10'}`}>
            <Upload className={`w-3.5 h-3.5 ${accent === 'orange' ? 'text-orange-500' : 'text-violet-500'}`} />
          </div>
          <h3 className="font-grotesk font-semibold text-sm text-gray-900 dark:text-white">{title}</h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors
            ${dragging
              ? 'border-orange-400 bg-orange-50/40 dark:bg-orange-500/5'
              : 'border-gray-200 dark:border-white/10 hover:border-orange-300 dark:hover:border-orange-500/40 hover:bg-gray-50/50 dark:hover:bg-white/[0.02]'
            }`}
        >
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/8 flex items-center justify-center">
            <Upload className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Drop file here or <span className="text-orange-500">browse</span></p>
            <p className="text-[11px] text-gray-400 mt-0.5">PDF, PNG, JPG, CSV up to 20 MB</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
        </div>

        {/* Selected file */}
        {file && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
              <p className="text-[10px] text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            <FileText className="w-4 h-4 text-gray-400 shrink-0" />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-white/[0.06]">
        <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" disabled={!file} onClick={handleSubmit}>
          <Upload className="w-3.5 h-3.5" />
          Upload & Continue
        </Button>
      </div>
    </Modal>
  )
}
