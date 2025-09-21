import React, { useState } from "react";
import { Button } from "@/components/ui/button"; // Assuming this is needed for the buttons used
import { Card, CardContent, CardHeader } from "@/components/ui/card"; // New based on structure
import { Badge } from "@/components/ui/badge"; // New based on outline for tags
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Likely used in CardHeader for user avatar

import { Heart, MessageCircle, Share, BarChart, Image as ImageIcon, FileText, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

// Placeholder for vibeColors definition - actual content should be provided by the user if specific colors are needed.
// This structure assumes a mapping from a 'vibe' string to Tailwind CSS classes.
const vibeColors = {
  'positive': 'bg-green-100 text-green-800',
  'negative': 'bg-red-100 text-red-800',
  'neutral': 'bg-gray-100 text-gray-800',
  'happy': 'bg-yellow-100 text-yellow-800',
  'sad': 'bg-blue-100 text-blue-800',
  'excited': 'bg-orange-100 text-orange-800',
  // Add more as needed by your application
};

// Definition for contentTypeIcons based on usage in the component and lucide-react imports.
// This maps content_type strings to their corresponding Lucide React icon components.
const contentTypeIcons = {
  'text': FileText,
  'image': ImageIcon,
  'poll': BarChart,
  // Add other content types if your application supports them
};

export default function PostCard({ post, currentUser, isVibed, onEngagement, onVibeToggle }) {
  const [hasEngaged, setHasEngaged] = useState(false);
  const [selectedPollOption, setSelectedPollOption] = useState(null);

  const handleEngagement = () => {
    // This is a placeholder. In a real app, this would update the backend.
    // Call onEngagement prop if provided to notify parent component
    if (onEngagement) {
      onEngagement(post.id, 'like'); // Assuming 'like' is the type of engagement
    }
    setHasEngaged(true); // Mark as engaged locally
  };

  const handlePollVote = (optionIndex) => {
    // This is a placeholder. In a real app, this would update the backend.
    if (selectedPollOption === null) { // Only allow voting if not already voted
      setSelectedPollOption(optionIndex);
      // You would typically call an onVote prop here to send the vote to the parent/backend
      // e.g., if (onVote) { onVote(post.id, optionIndex); }
    }
  };

  const ContentIcon = contentTypeIcons[post.content_type];
  const totalVotes = post.poll_options?.reduce((sum, option) => sum + (option.votes || 0), 0) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="rounded-3xl border border-gray-200 shadow-sm overflow-hidden transform transition-all duration-300 hover:shadow-md">
        <CardHeader className="flex flex-row items-center space-x-4 p-4 sm:px-6 sm:pt-6 pb-4">
          {/* Assumed structure for CardHeader based on common social media post design */}
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${post.author?.username || 'user'}`} alt={post.author?.username || 'User'} />
            <AvatarFallback>{post.author?.username?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">{post.author?.username || 'Unknown User'}</p>
              {post.vibe && (
                <Badge variant="secondary" className={`px-2 py-0.5 text-xs rounded-full ${vibeColors[post.vibe] || 'bg-gray-100 text-gray-800'}`}>
                  {post.vibe}
                </Badge>
              )}
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <span className="mr-1">{post.timestamp ? format(new Date(post.timestamp), 'MMM dd, yyyy HH:mm') : 'Unknown Date'}</span>
              {ContentIcon && <ContentIcon className="w-3 h-3 text-gray-400" />}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Post Content */}
          <div className="space-y-3">
            <p className="text-gray-800 text-lg leading-relaxed">{post.content}</p>
            
            {/* Image Content */}
            {post.content_type === 'image' && post.image_url && (
              <div className="rounded-2xl overflow-hidden">
                <img
                  src={post.image_url}
                  alt="Post content"
                  className="w-full max-h-96 object-cover"
                />
              </div>
            )}
            
            {/* Poll Content */}
            {post.content_type === 'poll' && post.poll_options && (
              <div className="space-y-3">
                {post.poll_options.map((option, index) => {
                  const percentage = totalVotes > 0 ? (option.votes / totalVotes * 100) : 0;
                  const isSelected = selectedPollOption === index;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handlePollVote(index)}
                      disabled={selectedPollOption !== null} // Disable voting after a selection is made
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${
                        isSelected 
                          ? 'border-purple-400 bg-purple-50' 
                          : selectedPollOption !== null // If a selection has been made, but it's not THIS option
                          ? 'border-gray-200 bg-gray-50'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25' // Before any selection
                      }`}
                    >
                      {/* Progress bar overlay for poll results */}
                      {selectedPollOption !== null && (
                        <div 
                          className="absolute inset-0 bg-gradient-to-r from-purple-100 to-blue-100 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      )}
                      <div className="relative flex justify-between items-center">
                        <span className="font-medium text-gray-800">{option.option}</span>
                        {selectedPollOption !== null && (
                          <span className="font-bold text-purple-600">
                            {percentage.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
                {totalVotes > 0 && (
                  <p className="text-sm text-gray-500 text-center">
                    {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-purple-600 border-purple-200">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Engagement Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEngagement}
                className={`gap-2 rounded-2xl transition-all duration-300 ${
                  hasEngaged 
                    ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                    : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <Heart className={`w-5 h-5 ${hasEngaged ? 'fill-current' : ''}`} />
                <span className="font-medium hidden sm:block">
                  {(post.engagement_count || 0) + (hasEngaged ? 1 : 0)}
                </span>
              </Button>
              
              <Button variant="ghost" size="sm" className="gap-2 rounded-2xl text-gray-600 hover:text-blue-500 hover:bg-blue-50">
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium hidden sm:block">Reply</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onVibeToggle}
                disabled={!currentUser}
                className={`gap-2 rounded-2xl transition-all duration-300 ${
                  isVibed
                    ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                    : 'text-gray-600 hover:text-yellow-500 hover:bg-yellow-50'
                }`}
              >
                <Sparkles className={`w-5 h-5 ${isVibed ? 'fill-current' : ''}`} />
                <span className="font-medium hidden sm:block">Vibe</span>
              </Button>
            </div>
            
            <Button variant="ghost" size="sm" className="gap-2 rounded-2xl text-gray-600 hover:text-purple-500 hover:bg-purple-50">
              <Share className="w-5 h-5" />
              <span className="font-medium hidden sm:block">Share</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
