import React, { useState, useEffect } from "react";
import { Post, Community } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Sparkles, Users, Hash } from "lucide-react";

import PostCard from "@/components/feed/PostCard";
import CommunityPreview from "@/components/community/CommunityPreview";
import TrendingTopics from "@/components/discover/TrendingTopics";

export default function Discover() {
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVibe, setSelectedVibe] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDiscoverData();
  }, []);

  const loadDiscoverData = async () => {
    setIsLoading(true);
    try {
      const [postsData, communitiesData] = await Promise.all([
        Post.list("-engagement_count", 20),
        Community.list("-member_count", 6)
      ]);
      setPosts(postsData);
      setCommunities(communitiesData);
    } catch (error) {
      console.error("Error loading discover data:", error);
    }
    setIsLoading(false);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesVibe = selectedVibe === "all" || post.vibe === selectedVibe;
    return matchesSearch && matchesVibe;
  });

  const handleEngagement = async (postId) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (post) {
        await Post.update(postId, {
          engagement_count: (post.engagement_count || 0) + 1
        });
        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, engagement_count: (p.engagement_count || 0) + 1 }
            : p
        ));
      }
    } catch (error) {
      console.error("Error updating engagement:", error);
    }
  };

  const vibeOptions = ["all", "creative", "authentic", "chill", "inspiring", "fun"];

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4 py-6">
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Discover
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore trending content, discover new communities, and connect with amazing creators.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search posts and topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 rounded-2xl border-2 focus:border-blue-400 bg-white/50 backdrop-blur-sm"
          />
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm rounded-2xl">
            <TabsTrigger value="posts" className="rounded-2xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="communities" className="rounded-2xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Communities
            </TabsTrigger>
            <TabsTrigger value="trending" className="rounded-2xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Hash className="w-4 h-4 mr-2" />
              Trending
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            {/* Vibe Filter */}
            <div className="flex justify-center">
              <div className="flex flex-wrap gap-2 p-2 bg-white/50 backdrop-blur-sm rounded-2xl">
                {vibeOptions.map((vibe) => (
                  <Button
                    key={vibe}
                    variant={selectedVibe === vibe ? "default" : "ghost"}
                    onClick={() => setSelectedVibe(vibe)}
                    className={`rounded-xl px-4 py-2 font-medium transition-all duration-300 ${
                      selectedVibe === vibe 
                        ? 'pulse-gradient text-white shadow-lg' 
                        : 'hover:bg-white/70'
                    }`}
                  >
                    {vibe === "all" ? "All Vibes" : vibe.charAt(0).toUpperCase() + vibe.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Posts Feed */}
            {isLoading ? (
              <div className="space-y-6">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="pulse-card rounded-3xl p-6 space-y-4">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/4" />
                          <div className="h-3 bg-gray-200 rounded w-1/6" />
                        </div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-32 bg-gray-200 rounded-2xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={null}
                    onEngagement={() => handleEngagement(post.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 space-y-4">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center">
                  <Search className="w-12 h-12 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700">No posts found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Try adjusting your search or explore different vibes to discover amazing content.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="communities" className="space-y-6">
            {communities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities.map((community) => (
                  <CommunityPreview key={community.id} community={community} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 space-y-4">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl flex items-center justify-center">
                  <Users className="w-12 h-12 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700">No communities yet</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Be the first to create communities and bring people together.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <TrendingTopics posts={posts} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}