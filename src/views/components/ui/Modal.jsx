import { useEffect, useRef } from 'react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle bg-slate-900/40 backdrop-blur-sm z-[100]">
      <div className={`modal-box bg-white ${maxWidth}`}>
        <button 
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >✕</button>
        {title && <h3 className="font-bold text-lg mb-4 text-slate-800">{title}</h3>}
        {children}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
