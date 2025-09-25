"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const email = formData.get("email") as string;
        console.log(email);
        setIsLoading(true);
       
        try {
            console.log("Logging in...");
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });
            const resData = await res.json();
            console.log(resData);
            if (resData.success) {
                // document.cookie = `token=${resData.token}; path=/; max-age=3600;`;
                router.push(`/otp?userid=${resData.responseData.userid}`);
            }
            else {
                router.push("/signup");
                alert("Login failed");
            }
        }
        catch (error) {
            console.log(error);
        }
        finally {
            setIsLoading(false);
        }
    }
    
    return (
        <div className="w-full h-screen flex items-center justify-start flex-col gap-5 mt-20">
            <h1 className="text-2xl font-bold">Login</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-1/3">
                <Input type="email" name="email" id="email" placeholder="Enter your email" />
                <Button type="submit"> {isLoading ? "Logging in..." : "Login"}</Button>
            </form>
            <Button variant="secondary" onClick={()=>router.push("/signup")}>Sign up</Button>
        </div>
    )
}