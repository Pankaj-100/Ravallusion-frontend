import AuthNavbar from "@/components/loginSignupFlow/AuthNavbar";

export default function AuthLayout({ children }) {
    
    return (
        // Add overflow-hidden to the main container
        <div className="flex flex-col items-center justify-center relative overflow-hidden mx-10">

            <AuthNavbar />
            {children}

            {/* Ellipse - Fixed positioning */}
            <div
                className="-z-10 fixed -top-7 -right-20 lg:-top-72 lg:-right-32 
             w-[280px] h-[280px] lg:w-[630px] lg:h-[630px] 
             bg-[url('/ellipse_of_auth.png')] bg-no-repeat bg-contain pointer-events-none"
                style={{
                    background: `
      linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%),
      url('/ellipse_of_auth.png')`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <div className="w-full h-full"></div>
            </div>

        </div>
    );
}