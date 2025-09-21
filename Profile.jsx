
import React, { useState, useEffect } from "react";
import { User, Post, VibedPost } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, Edit, Save, X, Heart, MessageCircle, Calendar, Sparkles } from "lucide-react";
import { format } from "date-fns";

import PostCard from "../components/feed/PostCard";
import VibeBoard from "../components/profile/VibeBoard";
import { Spinner } from "@/components/ui/spinner"; // Assuming this import exists or is needed for loading spinner

export default function Profile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    bio: "",
    vibe_style: "authentic",
    interests: []
  });
  const [vibedPostIds, setVibedPostIds] = useState(new Set());

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      setEditForm({
        bio: user.bio || "",
        vibe_style: user.vibe_style || "authentic",
        interests: user.interests || []
      });

      const [posts, userVibedPosts] = await Promise.all([
        Post.filter({ created_by: user.email }, "-created_date"),
        VibedPost.filter({ created_by: user.email })
      ]);
      setUserPosts(posts);
      setVibedPostIds(new Set(userVibedPosts.map(vp => vp.post_id)));
    } catch (error) {
      console.error("Error loading user data:", error);
    }
    setIsLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const updatedUser = await User.update(currentUser.id, editForm);
      setCurrentUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
    setIsLoading(false);
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

  const addInterest = (interest) => {
    const trimmedInterest = interest.trim();
    if (trimmedInterest && !editForm.interests.includes(trimmedInterest)) {
      setEditForm(prev => ({
        ...prev,
        interests: [...prev.interests, trimmedInterest]
      }));
    }
  };

  const removeInterest = (interestToRemove) => {
    setEditForm(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest !== interestToRemove)
    }));
  };

  const totalEngagement = userPosts.reduce((sum, post) => sum + (post.engagement_count || 0), 0);
  const joinDate = currentUser?.created_date ? format(new Date(currentUser.created_date), "MMM d, yyyy") : "N/A";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <Card className="pulse-card rounded-3xl border-0 shadow-lg">
          <CardHeader className="flex flex-col items-center p-6">
            <Avatar className="w-24 h-24 mb-4 border-4 border-primary/50 shadow-md">
              <AvatarImage src={currentUser?.profile_picture_url || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${currentUser?.email}`} alt="@shadcn" />
              <AvatarFallback>{currentUser?.display_name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl font-bold text-center">{currentUser?.display_name}</CardTitle>
            <p className="text-sm text-gray-500">@{currentUser?.username}</p>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="vibe_style">Vibe Style</Label>
                  <Select
                    value={editForm.vibe_style}
                    onValueChange={(value) => setEditForm({ ...editForm, vibe_style: value })}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select a vibe style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="authentic">Authentic</SelectItem>
                      <SelectItem value="playful">Playful</SelectItem>
                      <SelectItem value="wise">Wise</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="calm">Calm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="interests">Interests (Type and press Enter)</Label>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {editForm.interests.map((interest, index) => (
                      <Badge key={index} className="flex items-center gap-1">
                        {interest}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeInterest(interest)} />
                      </Badge>
                    ))}
                    <Input
                      id="interests"
                      placeholder="Add an interest"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.currentTarget.value) {
                          addInterest(e.currentTarget.value);
                          e.currentTarget.value = "";
                          e.preventDefault();
                        }
                      }}
                      className="w-auto min-w-[120px] max-w-[200px]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <p className="text-center text-gray-700">{currentUser?.bio || "No bio yet. Click edit to add one!"}</p>
                {currentUser?.vibe_style && (
                  <div className="flex justify-center">
                    <Badge variant="secondary" className="px-3 py-1 text-md font-semibold capitalize">
                      {currentUser.vibe_style} Vibe
                    </Badge>
                  </div>
                )}
                {currentUser?.interests && currentUser.interests.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {currentUser.interests.map((interest, index) => (
                      <Badge key={index} variant="outline">{interest}</Badge>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-center p-6 border-t border-gray-100">
            {isEditing ? (
              <div className="flex gap-2">
                <Button onClick={handleSaveProfile} disabled={isLoading} className="bg-primary hover:bg-primary-dark">
                  <Save className="w-4 h-4 mr-2" /> Save
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="pulse-card rounded-3xl border-0 shadow-lg p-5 flex flex-col items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary mb-2" />
            <div className="text-3xl font-bold">{userPosts.length}</div>
            <p className="text-sm text-gray-500">Total Posts</p>
          </Card>
          <Card className="pulse-card rounded-3xl border-0 shadow-lg p-5 flex flex-col items-center justify-center">
            <Heart className="w-8 h-8 text-red-500 mb-2" />
            <div className="text-3xl font-bold">{totalEngagement}</div>
            <p className="text-sm text-gray-500">Total Vibes</p>
          </Card>
          <Card className="pulse-card rounded-3xl border-0 shadow-lg p-5 flex flex-col items-center justify-center">
            <Calendar className="w-8 h-8 text-green-500 mb-2" />
            <div className="text-3xl font-bold">{joinDate}</div>
            <p className="text-sm text-gray-500">Joined</p>
          </Card>
        </div>

        {/* User Content */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm rounded-2xl p-1">
            <TabsTrigger value="posts" className="flex items-center gap-2 rounded-xl">
              <MessageCircle className="w-4 h-4" />
              Your Posts
            </TabsTrigger>
            <TabsTrigger value="vibe-board" className="flex items-center gap-2 rounded-xl">
              <Sparkles className="w-4 h-4" />
              Vibe Board
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <Card className="pulse-card rounded-3xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Your Posts</CardTitle>
              </CardHeader>
              <CardContent>
                {userPosts.length > 0 ? (
                  <div className="space-y-6">
                    {userPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        currentUser={currentUser}
                        isVibed={vibedPostIds.has(post.id)}
                        onVibeToggle={() => handleVibeToggle(post)}
                        onEngagement={() => {}}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-4">
                    <Sparkles className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="text-lg text-gray-600 font-semibold">No posts yet!</p>
                    <p className="text-gray-500">Start sharing your thoughts and vibes with the world.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vibe-board" className="mt-6">
            <VibeBoard userEmail={currentUser?.email} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
