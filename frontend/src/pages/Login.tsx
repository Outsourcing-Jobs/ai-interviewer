import { useState, useEffect } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { login, reset, googleLogin } from "../features/auth/authSlice";
import type { RootState, AppDispatch } from "../app/store";
import type { User } from "../types/user";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import PasswordInput from "../components/PasswordInput";

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const { email, password } = formData;

    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { user, isLoading, isError, isSuccess, message } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        dispatch(reset());
    }, [dispatch]);

    useEffect(() => {
        if (isError) {
            toast.error(message || "Invalid email or password");
            dispatch(reset());
        }

        if (isSuccess && user) {
            toast.success("Login successful");
            navigate("/");
            dispatch(reset());
        }
    }, [user, isError, isSuccess, message, navigate, dispatch]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        dispatch(login(formData as unknown as User));
    };

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const firebaseIdToken = await result.user.getIdToken();
            dispatch(googleLogin(firebaseIdToken));
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Google Sign-In failed";
            // Ignore popup-closed-by-user errors silently
            if (!msg.includes("popup-closed-by-user") && !msg.includes("cancelled-popup-request")) {
                toast.error("Google Sign-In failed. Please try again.");
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>);
    }

    return (
        <div className="flex flex-col justify-center items-center min-h-[85vh] py-12 px-4">
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-white border border-slate-200/80 shadow-2xl shadow-slate-200/60 rounded-[2.5rem] p-10 relative overflow-hidden">
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-100/60 blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    
                    <div className="text-center mb-10 relative z-10">
                        <h2 className="text-4xl font-extrabold tracking-tight mb-3 text-slate-900">
                            Chào mừng <span className="text-gradient">trở lại</span>
                        </h2>
                        <p className="text-slate-500 text-sm font-medium">Đăng nhập vào tài khoản AI Interviewer</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Địa chỉ Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                value={email} 
                                onChange={handleChange} 
                                className="glass-input" 
                                placeholder="name@company.com" 
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Mật khẩu</label>
                            <PasswordInput
                                id="password"
                                name="password"
                                value={password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="btn-primary w-full text-sm uppercase tracking-widest font-black"
                        >
                            Đăng nhập
                        </button>
                    </form>

                    <div className="my-8 flex items-center relative z-10">
                        <div className="grow border-t border-slate-200"></div>
                        <div className="mx-4 text-slate-400 text-[10px] font-black tracking-[0.2em] uppercase">Hoặc</div>
                        <div className="grow border-t border-slate-200"></div>
                    </div>
                    
                    <div className="w-full flex items-center justify-center relative z-10">
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold tracking-wide shadow-xs transition-all duration-200 hover:border-slate-300 active:scale-[0.98] cursor-pointer"
                        >
                            {/* Google logo SVG */}
                            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                                <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.548 0 9s.348 2.826.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                            </svg>
                            Đăng nhập bằng Google
                        </button>
                    </div>

                    <div className="mt-8 text-center relative z-10">
                        <p className="text-slate-500 text-sm font-medium">
                            Chưa có tài khoản?{" "}
                            <Link to="/register" className="text-teal-600 hover:text-teal-700 font-bold underline underline-offset-4 transition-colors">Đăng ký ngay</Link>
                        </p>
                    </div>
                </div>

                {/* Footer text */}
                <p className="mt-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    &copy; 2024 Prepify AI. Built for the next generation of talent.
                </p>
            </div>
        </div>
    );
}

export default Login