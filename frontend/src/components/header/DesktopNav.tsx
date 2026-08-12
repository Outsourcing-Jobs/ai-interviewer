import { Link } from "react-router-dom";
import { UserProfileMenu } from "./UserProfileMenu";

interface DesktopNavProps {
  user: { name: string; role?: string } | null;
  isActive: (path: string) => boolean;
  onOpenModal: () => void;
}

export const DesktopNav = ({ user, isActive, onOpenModal }: DesktopNavProps) => {
  return (
    <nav className="hidden md:flex items-center space-x-8">
      {user ? (
        <>
          <Link
            to="/"
            className={`relative py-1 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 group ${isActive("/") ? "text-teal-600" : "text-slate-600 hover:text-slate-900"
              }`}
          >
            Trang chủ
            <span
              className={`absolute -bottom-1 left-0 h-0.5 bg-teal-600 transition-all duration-500 rounded-full ${isActive("/") ? "w-full" : "w-0 group-hover:w-full"
                }`}
            ></span>
          </Link>

          <Link
            to="/resume-analyzer"
            className={`relative py-1 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 group ${isActive("/resume-analyzer")
              ? "text-teal-600"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            Phân tích CV
            <span
              className={`absolute -bottom-1 left-0 h-0.5 bg-teal-600 transition-all duration-500 rounded-full ${isActive("/resume-analyzer") ? "w-full" : "w-0 group-hover:w-full"
                }`}
            ></span>
          </Link>

          <Link
            to="/analytics"
            className={`relative py-1 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 group ${isActive("/analytics")
              ? "text-teal-600"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            Thống kê & Tiến độ
            <span
              className={`absolute -bottom-1 left-0 h-0.5 bg-teal-600 transition-all duration-500 rounded-full ${isActive("/analytics") ? "w-full" : "w-0 group-hover:w-full"
                }`}
            ></span>
          </Link>

          {user.role === "admin" && (
            <Link
              to="/admin"
              className={`relative py-1.5 px-3.5 rounded-full text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 flex items-center space-x-1.5 border ${
                isActive("/admin")
                  ? "bg-amber-100/80 text-amber-800 border-amber-300 shadow-xs"
                  : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:text-amber-900"
              }`}
            >
              <span>Trang Quản trị</span>
              <span className="text-xs">👑</span>
            </Link>
          )}

          <UserProfileMenu user={user} onOpenModal={onOpenModal} />
        </>
      ) : (
        <div className="flex space-x-8 items-center">
          <Link
            to="/login"
            className={`relative py-1 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 group ${isActive("/login") ? "text-teal-600" : "text-slate-600 hover:text-slate-900"
              }`}
          >
            Đăng nhập
            <span
              className={`absolute -bottom-1 left-0 h-0.5 bg-teal-600 transition-all duration-500 rounded-full ${isActive("/login") ? "w-full" : "w-0 group-hover:w-full"
                }`}
            ></span>
          </Link>
          <Link
            to="/register"
            className="btn-primary text-[11px] font-black uppercase tracking-widest py-2 px-5 rounded-xl shadow-sm"
          >
            Đăng ký
          </Link>
        </div>
      )}
    </nav>
  );
};
