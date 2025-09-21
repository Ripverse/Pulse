
import React, { useState, useEffect, useCallback } from "react";
import { Post, VibedPost } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function VibeBoard({ userEmail }) {
  const [vibedPosts, setVibedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadVibedPosts = useCallback(async () => {
    if (!userEmail) {
      setIsLoading(false); // Ensure loading state is false if no userEmail
      setVibedPosts([]);
      return;
    }
    setIsLoading(true);
    try {
      const vibedPostRecords = await VibedPost.filter({ created_by: userEmail }, "-created_date");
      const postIds = vibedPostRecords.map(vp => vp.post_id);

      if (postIds.length > 0) {
        // Fetch posts in batches if needed, but for now fetching all
        const posts = await Post.list(); 
        const postMap = new Map(posts.map(p => [p.id, p]));
        const orderedPosts = postIds.map(id => postMap.get(id)).filter(Boolean);
        setVibedPosts(orderedPosts);
      } else {
        setVibedPosts([]);
      }
    } catch (error) {
      console.error("Error loading vibe board:", error);
      setVibedPosts([]); // Clear posts on error
    }
    setIsLoading(false);
  }, [userEmail]); // userEmail is a dependency of this callback

  useEffect(() => {
    loadVibedPosts();
  }, [userEmail, loadVibedPosts]); // loadVibedPosts is a dependency now

  return (
    <Card className="pulse-card rounded-3xl border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-bold">
          <Sparkles className="w-6 h-6 text-yellow-500" />
          Your Vibe Board
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, index) => (
              <div key={index} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : vibedPosts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
            {vibedPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative aspect-square overflow-hidden rounded-2xl cursor-pointer"
              >
                {post.content_type === 'image' && post.image_url ? (
                  <img
                    src={post.image_url}
                    alt={post.content}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center p-4">
                     <p className="text-sm font-medium text-purple-800 text-center line-clamp-4">
                        {post.content}
                     </p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <p className="text-white text-sm font-semibold line-clamp-2">
                    {post.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-4">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700">Your Vibe Board is empty</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Click the 'Vibe' button on posts you love to add them to your personal collection.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
