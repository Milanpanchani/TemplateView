"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"


export default function Otp() {
    const searchParams = useSearchParams()
    const userId = searchParams.get("userid")
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const otp = formData.get("otp")
        // console.log(otp, userId)
        try {
            const res = await fetch("/api/auth/otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ otp, userId })
            })
            const resData = await res.json()
            console.log(resData)
            if (resData.success) {
                document.cookie = `token=${resData.token}; path=/; max-age=3600;` 
                router.push("/")
                alert("OTP verification successful")
            }
            else {
                alert("OTP verification failed")
            }
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <>
         <div className="w-full h-screen flex items-center justify-start flex-col gap-5 mt-20">

            <div className="text-2xl font-bold">Verify OTP</div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-1/3">
                <Input type="text" name="otp" placeholder="Enter OTP" />
                <Button type="submit">Verify</Button>
            </form>
         </div>


        </>
    )
}   