import { sendEmail } from "./emailServices";

function generateOtp(){
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendOtp(otp: string, email: string){
    return sendEmail(email, "OTP for your account", `Your OTP is ${otp}`);
}

export { generateOtp, sendOtp };