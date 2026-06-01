import { FaUtensils } from 'react-icons/fa';

export default function ProductMedia({ media, name, size = 'w-14 h-14' }) {
  const isUrl = media && (media.startsWith('http') || media.startsWith('/') || media.startsWith('data:'));
  return (
    <div className={`${size} rounded-2xl overflow-hidden flex items-center justify-center shrink-0 bg-slate-50 border border-slate-100 shadow-inner`}>
      {isUrl ? (
        <img
          src={media}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      ) : (
        <FaUtensils className="text-2xl text-slate-350 select-none filter drop-shadow-sm transform group-hover:scale-110 transition-transform duration-500" />
      )}
    </div>
  );
}
