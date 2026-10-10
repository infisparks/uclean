import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF6EE] flex flex-col items-center justify-center p-6 text-center">
      <h2 className="font-heading text-2xl font-black text-[#072618] mb-2">Page Not Found</h2>
      <p className="text-sm text-[#4e6b5d] mb-6">The page you are looking for does not exist or has been moved.</p>
      <Link
        href="/"
        className="bg-[#008f51] hover:bg-[#072618] text-white px-6 py-2.5 rounded-full font-heading font-bold text-xs tracking-wide shadow-md transition-all"
      >
        Return to Home
      </Link>
    </div>
  );
}
