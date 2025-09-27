"use client";

export default function Home() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   useEffect(()=>{
//     const checkAuthStatus = () => {
//         const cookies = document.cookie.split(';');
//         const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
//         console.log(!!tokenCookie);
//         setIsAuthenticated(!!tokenCookie);
//         // if (!tokenCookie) {
//         //   router.push("/login"); // redirect if not logged in
//         // }
//     }; 
//     checkAuthStatus();
// },[pathname,router])
  return (
    <div className="h-full p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, Milan!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here&apos;s what&apos;s happening with your projects today.
          </p>
        </div>
      </div>
    </div>
  );
}
