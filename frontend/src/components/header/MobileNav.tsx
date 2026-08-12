import { Link } from "react-router-dom";

interface MobileNavProps {
  user: { name: string; role?: string } | null;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  isActive: (path: string) => boolean;
  onOpenModal: () => void;
}

export const MobileNav = ({
  user,
  isOpen,
  onToggle,
  onClose,
  isActive,
  onOpenModal,
}: MobileNavProps) => {
  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={onToggle}
        className="md:hidden p-2 rounded-xl bg-white border border-slate-200 hover:border-teal-500 transition-all duration-300 cursor-pointer group shadow-xs"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center space-y-1.5">
          <span
            className={`block w-5 h-0.5 bg-slate-700 transition-all duration-300 ${isOpen ? "rotate-45 translate-y-2" : ""
              }`}
          ></span>
          <span
            className={`block w-5 h-0.5 bg-slate-700 transition-all duration-300 ${isOpen ? "opacity-0" : "opacity-100"
              }`}
          ></span>
          <span
            className={`block w-5 h-0.5 bg-slate-700 transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
          ></span>
        </div>
      </button>

      {/* Mobile Navigation Dropdown */}
      <div
        className={`md:hidden absolute top-full left-0 w-full overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "max-h-125 border-b border-slate-200/80 shadow-xl" : "max-h-0"
          }`}
      >
        <div className="bg-white/95 backdrop-blur-2xl px-6 py-8 space-y-6">
          {user ? (
            <>
              <div
                onClick={() => {
                  onOpenModal();
                  onClose();
                }}
                className="flex items-center space-x-4 mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-teal-50/50 transition-all"
              >
                <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
                <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-800">
                  {user.name}
                </span>
              </div>
              <Link
                to="/"
                onClick={onClose}
                className={`block py-3 text-sm font-black uppercase tracking-[0.2em] transition-colors ${isActive("/") ? "text-teal-600" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Trang chủ
              </Link>
              <Link
                to="/resume-analyzer"
                onClick={onClose}
                className={`block py-3 text-sm font-black uppercase tracking-[0.2em] transition-colors ${isActive("/resume-analyzer")
                  ? "text-teal-600"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Phân tích CV
              </Link>
              <Link
                to="/analytics"
                onClick={onClose}
                className={`block py-3 text-sm font-black uppercase tracking-[0.2em] transition-colors ${isActive("/analytics")
                  ? "text-teal-600"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Thống kê & Tiến độ
              </Link>
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  onClick={onClose}
                  className={`block py-3 text-sm font-black uppercase tracking-[0.2em] transition-colors ${isActive("/admin")
                    ? "text-amber-700 font-black"
                    : "text-amber-600 hover:text-amber-800"
                    }`}
                >
                  Trang Quản trị 👑
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={onClose}
                className={`block py-3 text-sm font-black uppercase tracking-[0.2em] transition-colors ${isActive("/login") ? "text-teal-600" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className={`block py-3 text-sm font-black uppercase tracking-[0.2em] transition-colors ${isActive("/register") ? "text-teal-600" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};
