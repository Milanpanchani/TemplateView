"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Signup() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    // const [userData, setUserData] = useState<any>({});
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // console.log(e.target);
        const formData = new FormData(e.target as HTMLFormElement);
        // console.log(formData);
        const data = Object.fromEntries(formData);
        // console.log(data);
        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({data})
            })

            const resData = await res.json();
            console.log(resData);
            if (resData.success) {
                router.push(`/otp?userid=${resData.responseData.userid}`);
            }
            else {
                alert("signup failed");
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }

        // redirect("/otp");
    }
    return (
        <>
            <div className="w-full h-screen flex items-center justify-start flex-col gap-5 mt-20">
                <h1 className="text-2xl font-bold">Signup</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-1/3">
                    <Input type="text" name="name" id="name" placeholder="Enter your name" />
                    <Input type="email" name="email" id="email" placeholder="Enter your email" />
                    <Button type="submit"> {isLoading ? "Generating OTP..." : "Generate OTP"}</Button>
                </form>
                <Button variant="secondary" onClick={()=>router.push("/login")}>Back to login</Button>
            </div>

        </>
    )
}
