export default function BasicModal({
  open,
  title,
  description,
  primaryLabel,
  onPrimary,
  onClose,
}) {
  if (!open) return null;

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ✕
          </button>
        </div>
        {description && (
          <p className="mb-4 text-xs text-gray-600 whitespace-pre-line">
            {description}
          </p>
        )}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onPrimary}
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
