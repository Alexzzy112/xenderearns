export default function AdBanner() {
  return (
    <div className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center py-4 px-4 mt-8">
      <p className="text-sm sm:text-base font-medium">
        📢 Advertise with us — Reach thousands of active investors daily.{' '}
        <a href="/contact" className="underline font-bold hover:text-yellow-100">Contact us</a>
      </p>
    </div>
  );
}
