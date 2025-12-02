'use client';

import { useState } from 'react';
import { Search, Plus, BookOpen, FileText, Microscope, Laptop } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const categories = ['All', 'Books', 'Notes', 'Exams', 'Equipment', 'Other'];

const sampleItems = [
  {
    id: '1',
    title: 'Introduction to Psychology Textbook',
    description: 'PSY 101 textbook in excellent condition. Minimal highlighting.',
    category: 'Books',
    price: 45,
    condition: 'like_new',
    seller: 'Emma Wilson',
    seller_rating: 4.9,
    posted: '1 day ago',
  },
  {
    id: '2',
    title: 'Calculus II Complete Notes',
    description: 'Comprehensive notes covering all chapters. Includes practice problems and solutions.',
    category: 'Notes',
    price: 20,
    condition: 'good',
    seller: 'James Lee',
    seller_rating: 4.7,
    posted: '3 days ago',
  },
  {
    id: '3',
    title: 'Biology Lab Equipment Set',
    description: 'Complete dissection kit with case. Used once, like new condition.',
    category: 'Equipment',
    price: 35,
    condition: 'like_new',
    seller: 'Maria Garcia',
    seller_rating: 5.0,
    posted: '1 week ago',
  },
  {
    id: '4',
    title: 'Past Exam Collection - CS 201',
    description: 'Last 3 years of midterms and finals with solutions.',
    category: 'Exams',
    price: 15,
    condition: 'good',
    seller: 'Alex Kumar',
    seller_rating: 4.8,
    posted: '2 days ago',
  },
  {
    id: '5',
    title: 'Organic Chemistry Textbook',
    description: 'Latest edition with access code unused. Great condition.',
    category: 'Books',
    price: 80,
    condition: 'new',
    seller: 'Sophie Martin',
    seller_rating: 4.6,
    posted: '4 days ago',
  },
  {
    id: '6',
    title: 'Graphing Calculator TI-84',
    description: 'Works perfectly, includes case and manual.',
    category: 'Equipment',
    price: 60,
    condition: 'good',
    seller: 'David Chen',
    seller_rating: 4.9,
    posted: '5 days ago',
  },
];

const categoryIcons = {
  Books: BookOpen,
  Notes: FileText,
  Exams: FileText,
  Equipment: Laptop,
  Other: Microscope,
};

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = sampleItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'like_new': return 'bg-blue-100 text-blue-800';
      case 'good': return 'bg-yellow-100 text-yellow-800';
      case 'fair': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <main className="flex-1">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1e3a5f] to-[#2a4a6f] text-white py-12">
          <div className="pointer-events-none absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_15%_25%,rgba(244,208,63,0.28),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(15,31,51,0.55),transparent_40%)] bg-[length:160%_160%] animate-gradient-move" />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-10 -top-16 h-52 w-52 rounded-full bg-gradient-to-br from-[#d4af37] to-[#f4d03f] blur-3xl opacity-70 animate-float" />
            <div className="absolute right-0 top-6 h-60 w-60 rounded-full bg-gradient-to-br from-white/40 via-transparent to-[#d4af37]/25 blur-3xl opacity-70 animate-float" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">Marketplace</h1>
                <p className="text-gray-200">Buy and sell study materials and equipment</p>
              </div>
              <Button className="bg-[#d4af37] text-[#1e3a5f] hover:bg-[#c19b2e] font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                List Item
              </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-white"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48 h-12 bg-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-[#1e3a5f]">{filteredItems.length}</span> items
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => {
              const IconComponent = categoryIcons[item.category as keyof typeof categoryIcons] || Microscope;
              return (
                <Card
                  key={item.id}
                  className="hover:shadow-lg transition-all border-2 hover:border-[#d4af37] flex flex-col bg-white/90 backdrop-blur animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardContent className="p-6 flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-[#f0f0f0] rounded-lg flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-[#1e3a5f]" />
                      </div>
                      <Badge className="bg-[#d4af37] text-[#1e3a5f] hover:bg-[#c19b2e]">
                        {item.category}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="text-2xl font-bold text-[#1e3a5f]">
                        ${item.price}
                      </div>
                      <Badge className={getConditionColor(item.condition)}>
                        {item.condition.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">{item.seller}</span>
                      <span className="ml-2 text-[#d4af37]">★ {item.seller_rating}</span>
                      <span className="ml-auto text-gray-400">{item.posted}</span>
                    </div>
                  </CardContent>

                  <CardFooter className="p-6 pt-0">
                    <Button className="w-full bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No items found matching your criteria.</p>
              <p className="text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
