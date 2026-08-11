interface User {
    id: string;
    _id?: string;
    name: string;
    email: string;
    avatar: string;
    token: string;
    preferredRole?: string;
    role?: "user" | "admin";
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isError: boolean;
    message: string;
    isSuccess: boolean;
    isLoading: boolean;
    isProfileLoading: boolean;
}

export type { User, AuthState };