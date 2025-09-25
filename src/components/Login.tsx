"use client";
import { useRouter } from 'next/navigation';
import React from 'react'
const Login = () => {
    const router = useRouter();
    const handleLogin = () => {
        console.log("Login");
        router.push("/login");
    }
  return (
    <button onClick={()=>handleLogin()} className='px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium' >Login</button>
  )
}

export default Login