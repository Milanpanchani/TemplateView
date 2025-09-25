"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
    const pathname = usePathname();
    
    const navItems = [
        { href: "/", icon: "🏠", label: "Home" },
        { href: "/admin", icon: "👑", label: "Admin Dashboard" },
        { href: "/admin/addtemplate", icon: "➕", label: "Add Template" },
        { href: "/admin/tags", icon: "🏷️", label: "Tags" },
    ];
    
    return (
        <div className="col-start-1 row-span-2 bg-zinc-900 border-r border-zinc-700">
            <div className="h-full p-4 flex flex-col">
                <div className="mb-8">
                    <h1 className="text-white text-xl font-bold">Template View</h1>
                </div>
                
                <nav className="flex-1">
                    <ul className="space-y-2">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <Link 
                                    href={item.href} 
                                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                                        pathname === item.href 
                                            ? "bg-zinc-800 text-white" 
                                            : "text-gray-300 hover:bg-zinc-800 hover:text-white"
                                    }`}
                                >
                                    <span>{item.icon}</span>
                                    <span className="ml-3">{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </div>
    );
}