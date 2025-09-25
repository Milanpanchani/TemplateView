"use client";
import { Button } from "@/components/ui/button";
// import Login from "./admin/Login";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Login from "@/components/Login";

export default function Navbar() {
    const router = useRouter()
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState("User");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(()=>{
        const checkAuthStatus = async () => {
            console.log('🔍 Navbar checking auth status...');
            
            try {
                // Always check authentication by calling the API
                const response = await fetch('/api/auth/me');
                const data = await response.json();
                
                if (data.success && data.user) {
                    console.log('✅ Navbar: User is authenticated:', data.user.name);
                    setIsAuthenticated(true);
                    setUserName(data.user.name);
                } else {
                    console.log('❌ Navbar: User is not authenticated');
                    setIsAuthenticated(false);
                    setUserName("User");
                }
            } catch (error) {
                console.error('❌ Navbar: Error checking auth status:', error);
                setIsAuthenticated(false);
                setUserName("User");
            } finally {
                setIsLoading(false);
            }
        };
        
        // Check immediately
        checkAuthStatus();
        
        // Check again after a short delay to catch any timing issues
        const timeoutId = setTimeout(checkAuthStatus, 100);
        
        // Listen for focus events (when user returns to tab)
        const handleFocus = () => {
            console.log('🔄 Page focused, rechecking auth status');
            checkAuthStatus();
        };
        
        window.addEventListener('focus', handleFocus);
        
        // Also check when the page becomes visible
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                console.log('🔄 Page visible, rechecking auth status');
                checkAuthStatus();
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    },[pathname, router])
    const handleLogout = async () => {
        console.log('🚪 Logout button clicked');
        try {
            // Call logout API to clear server-side session
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                console.log('✅ Logout API successful');
                // Clear client-side authentication state
                setIsAuthenticated(false);
                setUserName("User");
                // Redirect to login page
                router.push("/login");
            } else {
                console.error('❌ Logout API failed');
            }
        } catch (error) {
            console.error('❌ Logout error:', error);
            // Even if API call fails, clear local state and redirect
            setIsAuthenticated(false);
            setUserName("User");
            router.push("/login");
        }
    }
    // console.log(isAuthenticated);
    return (
        <div className="col-start-2 row-start-1 bg-white dark:bg-zinc-900 px-6 flex items-center justify-between border-b border-gray-200 dark:border-zinc-700 shadow-sm">
            <div className="flex items-center">
                <h1 className="text-gray-900 dark:text-white text-xl font-semibold">Dashboard</h1>
            </div>

            <div className="flex items-center space-x-3">
                {isAuthenticated && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <span>Welcome back, {userName}</span>
                    </div>
                )}
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        🔔
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        ⚙️
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        Profile
                    </Button>
                    {isLoading ? (
                        <Button 
                            variant="outline"
                            size="sm"
                            disabled
                            className="opacity-50"
                        >
                            Loading...
                        </Button>
                    ) : isAuthenticated ? (
                        <Button 
                            onClick={handleLogout}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/20"
                        >
                            Logout
                        </Button>
                    ) : (
                        <Login />
                    )}
                    
                </div>
            </div>
        </div>
    );
}