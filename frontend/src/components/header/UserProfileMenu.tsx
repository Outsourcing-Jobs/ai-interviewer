interface UserProfileMenuProps {
  user: { name: string };
  onOpenModal: () => void;
}

export const UserProfileMenu = ({ user, onOpenModal }: UserProfileMenuProps) => {
  return (
    <button
      onClick={onOpenModal}
      className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs hover:border-teal-500/40 hover:shadow-md transition-all group cursor-pointer"
    >
      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)] group-hover:animate-pulse"></div>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 group-hover:text-teal-700 transition-colors">
        {user.name.split(" ")[0]}
      </span>
    </button>
  );
};
