import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({ className, children, ...props }) => {
    return (
        <div
            className={twMerge(
                'rounded-xl border border-gray-100 bg-white text-gray-950 shadow-sm transition-all duration-200 hover:shadow-md',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ className, children, ...props }) => (
    <div className={twMerge('flex flex-col space-y-1.5 p-6', className)} {...props}>
        {children}
    </div>
);

export const CardTitle = ({ className, children, ...props }) => (
    <h3 className={twMerge('font-semibold leading-none tracking-tight text-lg', className)} {...props}>
        {children}
    </h3>
);

export const CardContent = ({ className, children, ...props }) => (
    <div className={twMerge('p-6 pt-0', className)} {...props}>
        {children}
    </div>
);
