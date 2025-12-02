'use client';

import { useState } from 'react';
import { Star, MapPin, GraduationCap, Mail, Briefcase, ShoppingBag, MessageSquare, Edit } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockProfile = {
  id: '1',
  full_name: 'Sarah Johnson',
  email: 'sarah.j@university.edu',
  university: 'State University',
  major: 'Computer Science',
  year: 'Junior',
  bio: 'CS student passionate about web development and helping fellow students. Available for tutoring in programming and math.',
  rating: 4.8,
  total_ratings: 24,
  member_since: 'September 2023',
};

const mockJobs = [
  { id: '1', title: 'Math Tutoring', status: 'completed', earnings: 250 },
  { id: '2', title: 'Web Development', status: 'in_progress', earnings: 0 },
];

const mockListings = [
  { id: '1', title: 'Calculus Textbook', price: 45, status: 'sold' },
  { id: '2', title: 'Programming Notes', price: 20, status: 'available' },
];

const mockReviews = [
  {
    id: '1',
    rating: 5,
    comment: 'Excellent tutor! Very patient and explains concepts clearly.',
    reviewer: 'Mike Chen',
    date: '2 weeks ago',
  },
  {
    id: '2',
    rating: 5,
    comment: 'Great communication and delivered quality work on time.',
    reviewer: 'Emma Wilson',
    date: '1 month ago',
  },
  {
    id: '3',
    rating: 4,
    comment: 'Good seller, textbook was in great condition as described.',
    reviewer: 'Alex Kumar',
    date: '1 month ago',
  },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <main className="flex-1">
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2a4a6f] text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarFallback className="bg-[#d4af37] text-[#1e3a5f] text-3xl font-bold">
                  {mockProfile.full_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{mockProfile.full_name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-200 mb-3">
                  <div className="flex items-center">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    {mockProfile.major} - {mockProfile.year}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {mockProfile.university}
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {mockProfile.email}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-[#d4af37] text-[#1e3a5f] px-3 py-1 rounded-full font-semibold">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    {mockProfile.rating} ({mockProfile.total_ratings} reviews)
                  </div>
                  <Badge className="bg-white/20 text-white">
                    Member since {mockProfile.member_since}
                  </Badge>
                </div>
              </div>

              <Button className="bg-[#d4af37] text-[#1e3a5f] hover:bg-[#c19b2e] font-semibold">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white border mb-6">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
                Overview
              </TabsTrigger>
              <TabsTrigger value="jobs" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
                <Briefcase className="w-4 h-4 mr-2" />
                My Jobs
              </TabsTrigger>
              <TabsTrigger value="listings" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
                <ShoppingBag className="w-4 h-4 mr-2" />
                My Listings
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
                <Star className="w-4 h-4 mr-2" />
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#1e3a5f]">$250</div>
                    <p className="text-sm text-gray-500 mt-1">From completed jobs</p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Active Listings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#1e3a5f]">1</div>
                    <p className="text-sm text-gray-500 mt-1">Items for sale</p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Reputation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#1e3a5f]">{mockProfile.rating}</div>
                    <p className="text-sm text-gray-500 mt-1">Average rating</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-[#1e3a5f]">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{mockProfile.bio}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="jobs">
              <div className="grid gap-4">
                {mockJobs.map((job) => (
                  <Card key={job.id} className="border-2">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">{job.title}</h3>
                          <div className="flex items-center gap-4">
                            <Badge className={
                              job.status === 'completed' ? 'bg-green-100 text-green-800' :
                              job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {job.status.replace('_', ' ')}
                            </Badge>
                            {job.earnings > 0 && (
                              <span className="text-sm text-gray-600">
                                Earned: <span className="font-semibold text-[#1e3a5f]">${job.earnings}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" className="border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="listings">
              <div className="grid gap-4">
                {mockListings.map((listing) => (
                  <Card key={listing.id} className="border-2">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">{listing.title}</h3>
                          <div className="flex items-center gap-4">
                            <Badge className={
                              listing.status === 'sold' ? 'bg-gray-100 text-gray-800' :
                              'bg-green-100 text-green-800'
                            }>
                              {listing.status}
                            </Badge>
                            <span className="text-lg font-semibold text-[#1e3a5f]">${listing.price}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {listing.status === 'available' && (
                            <Button variant="outline" className="border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white">
                              Edit
                            </Button>
                          )}
                          <Button variant="outline" className="border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white">
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="grid gap-4">
                {mockReviews.map((review) => (
                  <Card key={review.id} className="border-2">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center mb-2">
                            <div className="flex items-center text-[#d4af37] mr-3">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`}
                                />
                              ))}
                            </div>
                            <span className="font-semibold text-[#1e3a5f]">{review.reviewer}</span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
