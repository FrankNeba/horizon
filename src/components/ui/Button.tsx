import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "success" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        const variants = {
            primary: "bg-primary text-white hover:opacity-90",
            secondary: "bg-secondary text-white hover:opacity-90",
            success: "bg-success text-white hover:opacity-90",
            outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
            ghost: "text-primary hover:bg-primary/10",
        };

        const sizes = {
            sm: "px-3 py-1.5 text-sm",
            md: "px-6 py-2.5 text-base font-semibold",
            lg: "px-8 py-4 text-lg font-bold",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";

export { Button };
