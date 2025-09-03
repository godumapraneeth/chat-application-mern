export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-purple-600 to-pink-500 text-white py-6 mt-6">
      <div className="text-center text-sm md:text-base">
        &copy; {new Date().getFullYear()} MyChatApp. All rights reserved.
      </div>
    </footer>
  );
}
