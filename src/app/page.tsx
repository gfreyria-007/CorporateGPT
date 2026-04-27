"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useCompany } from "@/components/providers/CompanyProvider";

export default function Home() {
  const { user, loading: authLoading, signInWithGoogle, logOut } = useAuth();
  const { config, loading: configLoading } = useCompany();

  if (authLoading || configLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden p-8 text-center space-y-6">
        
        {config.logoUrl && (
          <img src={config.logoUrl} alt="Logo" className="h-16 mx-auto object-contain mb-4" />
        )}

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{config.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {config.slogan}
          </p>
        </div>

        {!user ? (
          <div className="space-y-4">
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 bg-[var(--color-primary)] text-white py-3 px-4 rounded-xl transition-opacity hover:opacity-90 font-medium shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.8 15.71 17.58V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="white"/>
                <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.58C14.72 18.24 13.47 18.64 12 18.64C9.15 18.64 6.74 16.71 5.86 14.12H2.18V16.97C3.99 20.57 7.68 23 12 23Z" fill="white"/>
                <path d="M5.86 14.12C5.63 13.45 5.5 12.74 5.5 12C5.5 11.26 5.63 10.55 5.86 9.88V7.03H2.18C1.43 8.52 1 10.21 1 12C1 13.79 1.43 15.48 2.18 16.97L5.86 14.12Z" fill="white"/>
                <path d="M12 5.38C13.62 5.38 15.06 5.93 16.2 7.02L19.36 3.86C17.46 2.09 14.97 1 12 1C7.68 1 3.99 3.43 2.18 7.03L5.86 9.88C6.74 7.29 9.15 5.38 12 5.38Z" fill="white"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-3">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User Avatar"}
                  className="w-20 h-20 rounded-full border-4 border-gray-100 dark:border-gray-700 shadow-sm"
                />
              )}
              <div>
                <h2 className="text-lg font-semibold">{user.displayName}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl text-left space-y-2 border border-gray-100 dark:border-gray-700">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Access Level</div>
              <div className="text-sm">
                {user.email === "gfreyria@gmail.com" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">
                    👑 Super Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
                    👤 Standard User
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 space-y-3">
              {user.email === "gfreyria@gmail.com" && (
                <a 
                  href="/admin"
                  className="block w-full text-center bg-[var(--color-primary)] text-white py-2.5 rounded-xl font-medium transition-opacity hover:opacity-90 shadow-sm"
                >
                  Go to Admin Dashboard
                </a>
              )}
              <button
                onClick={logOut}
                className="w-full text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 py-2 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
