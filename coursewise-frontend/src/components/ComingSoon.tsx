import { Construction } from 'lucide-react';

export default function ComingSoon() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <Construction className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-bounce" />
      <h1 className="text-3xl font-bold mb-4">Coming Soon</h1>
      <p className="text-gray-600">We're working hard to bring you this feature!</p>
    </div>
  );
} 