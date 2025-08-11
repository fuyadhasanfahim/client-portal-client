import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-[60vh] grid place-items-center p-8">
            <div className="text-center">
                <h1 className="text-2xl font-semibold">404 — Not found</h1>
                <p className="text-sm text-muted-foreground mt-2">
                    The page you’re looking for doesn’t exist.
                </p>
                <Link
                    href="/"
                    className="mt-4 inline-flex items-center rounded-md border px-3 py-1.5"
                >
                    Go home
                </Link>
            </div>
        </div>
    );
}
