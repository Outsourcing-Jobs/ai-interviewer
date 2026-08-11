import { Link } from "react-router-dom";
import { UserProfileMenu } from "./UserProfileMenu";

interface DesktopNavProps {
  user: { name: string; role?: string } | null;
  isActive: (path: string) => boolean;
  onOpenModal: () => void;
}

export const DesktopNav = ({ user, isActive, onOpenModal }: DesktopNavProps) => {
  return (
    <nav className="hidden md:flex items-center space-x-10">
      {user ? (
        <>
          <Link
            to="/"
            className={`relative py-1 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 group ${isActive("/") ? "text-primary-400" : "text-surface-400 hover:text-white"
              }`}
          >
            Dashboard
            <span
              className={`absolute -bottom-1 left-0 h-0.5 bg-primary-400 transition-all duration-500 ${isActive("/") ? "w-full" : "w-0 group-hover:w-full"
                }`}
            ></span>
          </Link>

          <Link
            to="/resume-analyzer"
            className={`relative py-1 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 group ${isActive("/resume-analyzer")
              ? "text-primary-400"
              : "text-surface-400 hover:text-white"
              }`}
          >
            Resume Analyzer
            <span
              className={`absolute -bottom-1 left-0 h-0.5 bg-primary-400 transition-all duration-500 ${isActive("/resume-analyzer") ? "w-full" : "w-0 group-hover:w-full"
                }`}
            ></span>
          </Link>

          <Link
            to="/analytics"
            className={`relative py-1 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 group ${isActive("/analytics")
              ? "text-primary-400"
              : "text-surface-400 hover:text-white"
              }`}
          >
            Analytics
            <span
              className={`absolute -bottom-1 left-0 h-0.5 bg-primary-400 transition-all duration-500 ${isActive("/analytics") ? "w-full" : "w-0 group-hover:w-full"
                }`}
            ></span>
          </Link>

          {user.role === "admin" && (
            <Link
              to="/admin"
              className={`relative py-1 px-3 rounded-full text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 flex items-center space-x-1.5 border ${
                isActive("/admin")
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/10"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20 hover:text-amber-300"
              }`}
            >
              <span>Admin Portal</span>
              <span className="text-xs">👑</span>
            </Link>
          )}

          <UserProfileMenu user={user} onOpenModal={onOpenModal} />
        </>
      ) : (
        <div className="flex space-x-10">
          <Link
            to="/login"
            className={`relative py-1 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 group ${isActive("/login") ? "text-primary-400" : "text-surface-400 hover:text-white"
              }`}
          >
            Login
            <span
              className={`absolute -bottom-1 left-0 h-0.5 bg-primary-400 transition-all duration-500 ${isActive("/login") ? "w-full" : "w-0 group-hover:w-full"
                }`}
            ></span>
          </Link>
          <Link
            to="/register"
            className={`relative py-1 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 group ${isActive("/register") ? "text-primary-400" : "text-surface-400 hover:text-white"
              }`}
          >
            Register
            <span
              className={`absolute -bottom-1 left-0 h-0.5 bg-primary-400 transition-all duration-500 ${isActive("/register") ? "w-full" : "w-0 group-hover:w-full"
                }`}
            ></span>
          </Link>
        </div>
      )}
    </nav>
  );
};
