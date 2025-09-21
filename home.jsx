
import React, { useState, useEffect } from "react";
import { Post, Community, User, VibedPost } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import PostCard from "@/components/feed/PostCard";
import CommunityPreview from "@/components/community/CommunityPreview";
import LoadingFeed from "@/components/feed/LoadingFeed";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [vibedPostIds, setVibedPostIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [feedType, setFeedType] = useState("all");

  useEffect(() => {
    loadFeedData();
  }, []);

  const loadFeedData = async () => {
    setIsLoading(true);
    try {
      let user = null;
      try {
        user = await User.me();
        setCurrentUser(user);
      } catch (err) {
        console.log("User not authenticated");
      }

      const [postsData, communitiesData] = await Promise.all([
        Post.list("-created_date", 20),
        Community.list("-created_date", 5)
      ]);
      
      setPosts(postsData);
      setCommunities(communitiesData);

      if (user) {
        const userVibedPosts = await VibedPost.filter({ created_by: user.email });
        setVibedPostIds(new Set(userVibedPosts.map(vp => vp.post_id)));
      }
    } catch (error) {
      console.error("Error loading feed:", error);
    }
    setIsLoading(false);
  };

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

  const handleVibeToggle = async (post) => {
    if (!currentUser) return;

    const isVibed = vibedPostIds.has(post.id);
    
    try {
      if (isVibed) {
        const vibedPostRecords = await VibedPost.filter({ post_id: post.id, created_by: currentUser.email });
        if (vibedPostRecords.length > 0) {
          await VibedPost.delete(vibedPostRecords[0].id);
          setVibedPostIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(post.id);
            return newSet;
          });
        }
      } else {
        await VibedPost.create({ post_id: post.id });
        setVibedPostIds(prev => new Set(prev).add(post.id));
      }
    } catch (error) {
      console.error("Error toggling vibe:", error);
    }
  };

  const filteredPosts = feedType === "all" 
    ? posts 
    : posts.filter(post => post.vibe === feedType);

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Welcome Section */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-500" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
              Welcome to Pulse
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Express yourself authentically, discover amazing content, and connect with communities that matter to you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Create")}>
              <Button className="pulse-gradient text-white px-8 py-3 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                Create Your First Post
              </Button>
            </Link>
            <Link to={createPageUrl("Communities")}>
              <Button variant="outline" className="px-8 py-3 rounded-2xl font-medium border-2 border-purple-200 hover:bg-purple-50 transition-all duration-300">
                Explore Communities
              </Button>
            </Link>
          </div>
        </div>

        {/* Communities Preview */}
        {communities.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-500" />
                Trending Communities
              </h2>
              <Link to={createPageUrl("Communities")}>
                <Button variant="ghost" className="text-purple-600 hover:text-purple-700">
                  View All
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {communities.slice(0, 3).map((community) => (
                <CommunityPreview key={community.id} community={community} />
              ))}
            </div>
          </div>
        )}

        {/* Feed Filters */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            Latest Posts
          </h2>
          <Tabs value={feedType} onValueChange={setFeedType}>
            <TabsList className="bg-white/50 backdrop-blur-sm">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="creative">Creative</TabsTrigger>
              <TabsTrigger value="authentic">Authentic</TabsTrigger>
              <TabsTrigger value="inspiring">Inspiring</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Posts Feed */}
        {isLoading ? (
          <LoadingFeed />
        ) : filteredPosts.length > 0 ? (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                isVibed={vibedPostIds.has(post.id)}
                onEngagement={() => handleEngagement(post.id)}
                onVibeToggle={() => handleVibeToggle(post)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-4">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700">No posts yet!</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Be the first to share something amazing with the community.
            </p>
            <Link to={createPageUrl("Create")}>
              <Button className="pulse-gradient text-white px-6 py-2 rounded-2xl font-medium mt-4">
                Create First Post
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
