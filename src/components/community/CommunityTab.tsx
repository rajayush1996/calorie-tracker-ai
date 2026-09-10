'use client';

import React, { useState, useEffect } from 'react';
import { CommunityPost, UserProfile, UserAccount } from '@/types';
import { loadCommunityPosts, saveCommunityPosts } from '@/utils/storage';
import {
  Users,
  Flame,
  MessageCircle,
  Plus,
  Send,
  X,
  Share2,
  Check,
  TrendingDown,
  ShieldCheck,
  Trophy,
} from 'lucide-react';

interface CommunityTabProps {
  currentUser: UserAccount;
  userProfile: UserProfile;
}

type CategoryFilter = 'All' | 'Fat Loss' | 'Diet & Recipes' | 'Muscle Gain' | 'Consistency';

export const CommunityTab: React.FC<CommunityTabProps> = ({ currentUser, userProfile }) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // New Post Form State
  const [postTitle, setPostTitle] = useState('');
  const [postStory, setPostStory] = useState('');
  const [postTag, setPostTag] = useState<'Fat Loss' | 'Diet & Recipes' | 'Muscle Gain' | 'Consistency'>('Fat Loss');
  const [startWeight, setStartWeight] = useState('');
  const [currentWeight, setCurrentWeight] = useState(userProfile.currentWeightKg.toString());
  const [weeksTaken, setWeeksTaken] = useState('');

  useEffect(() => {
    const loaded = loadCommunityPosts();
    setPosts(loaded);
  }, []);

  const handleLikeToggle = (postId: string) => {
    setPosts((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== postId) return p;
        const newIsLiked = !p.isLiked;
        return {
          ...p,
          isLiked: newIsLiked,
          likesCount: newIsLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
        };
      });
      saveCommunityPosts(updated);
      return updated;
    });
  };

  const handleAddComment = (postId: string) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;

    setPosts((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== postId) return p;
        const newComment = {
          id: `c-${Date.now()}`,
          authorName: currentUser.name || 'Anonymous Peer',
          content: text,
          createdAt: 'Just now',
        };
        return {
          ...p,
          comments: [...p.comments, newComment],
        };
      });
      saveCommunityPosts(updated);
      return updated;
    });

    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postStory.trim()) return;

    const sWeight = parseFloat(startWeight);
    const cWeight = parseFloat(currentWeight);
    const wTaken = parseInt(weeksTaken);

    const hasMilestone = !isNaN(sWeight) && !isNaN(cWeight);

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorBadge: hasMilestone && sWeight > cWeight
        ? `-${(sWeight - cWeight).toFixed(1)} kg transformation 🔥`
        : 'Active NutriAI Member ⭐',
      timeAgo: 'Just now',
      tag: postTag,
      title: postTitle.trim(),
      story: postStory.trim(),
      milestoneStats: hasMilestone
        ? {
            startWeightKg: sWeight,
            currentWeightKg: cWeight,
            weeksTaken: !isNaN(wTaken) ? wTaken : undefined,
          }
        : undefined,
      likesCount: 1,
      isLiked: true,
      comments: [],
      createdAt: new Date().toISOString(),
    };

    const updated = [newPost, ...posts];
    setPosts(updated);
    saveCommunityPosts(updated);

    // Reset Form
    setPostTitle('');
    setPostStory('');
    setStartWeight('');
    setWeeksTaken('');
    setIsCreateModalOpen(false);
  };

  const filteredPosts = activeFilter === 'All'
    ? posts
    : posts.filter((p) => p.tag === activeFilter);

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner & Call to Action */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Transformation Stories
              </h2>
              <p className="text-[11px] text-slate-400">
                Real journeys, genuine milestones, and daily accountability.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="h-10 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-xs inline-flex items-center justify-center gap-1.5 active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Share Story</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {(['All', 'Fat Loss', 'Diet & Recipes', 'Muscle Gain', 'Consistency'] as CategoryFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === filter
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Community Feed Posts */}
      <div className="space-y-3.5">
        {filteredPosts.map((post) => {
          const isCommentsOpen = expandedComments[post.id];
          const hasMilestone = post.milestoneStats && post.milestoneStats.startWeightKg && post.milestoneStats.currentWeightKg;
          const weightDiff = hasMilestone
            ? (post.milestoneStats!.startWeightKg! - post.milestoneStats!.currentWeightKg!).toFixed(1)
            : null;

          return (
            <div
              key={post.id}
              className="bg-white rounded-3xl p-4.5 sm:p-5 border border-slate-100 shadow-xs space-y-3 transition-all"
            >
              {/* Post Author Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center font-black text-sm shadow-xs">
                    {post.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-xs text-slate-900">{post.authorName}</h3>
                      {post.authorBadge && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          {post.authorBadge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">{post.timeAgo}</span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600">
                  #{post.tag}
                </span>
              </div>

              {/* Milestone Stat Highlight Pill if available */}
              {hasMilestone && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Milestone Achievement
                      </span>
                      <strong className="text-emerald-900 font-extrabold">
                        {post.milestoneStats!.startWeightKg} kg ➔ {post.milestoneStats!.currentWeightKg} kg
                        {weightDiff && ` (-${weightDiff} kg)`}
                      </strong>
                    </div>
                  </div>
                  {post.milestoneStats!.weeksTaken && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-white/80 px-2 py-1 rounded-lg border border-emerald-200">
                      In {post.milestoneStats!.weeksTaken} weeks
                    </span>
                  )}
                </div>
              )}

              {/* Post Content */}
              <div className="space-y-1">
                <h4 className="font-black text-sm text-slate-900 leading-snug">{post.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {post.story}
                </p>
              </div>

              {/* Reactions & Comments Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  {/* Like Button */}
                  <button
                    onClick={() => handleLikeToggle(post.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold transition-all active:scale-95 ${
                      post.isLiked
                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                        : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Flame
                      className={`w-4 h-4 ${post.isLiked ? 'fill-amber-500 text-amber-500 animate-bounce' : 'text-slate-400'}`}
                    />
                    <span>{post.likesCount} {post.likesCount === 1 ? 'Cheer' : 'Cheers'}</span>
                  </button>

                  {/* Comment Toggle Button */}
                  <button
                    onClick={() =>
                      setExpandedComments((prev) => ({
                        ...prev,
                        [post.id]: !prev[post.id],
                      }))
                    }
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl hover:bg-slate-100 text-slate-600 font-medium transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-slate-400" />
                    <span>{post.comments.length}</span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span>Verified Journey</span>
                </div>
              </div>

              {/* Expanded Comments Drawer */}
              {isCommentsOpen && (
                <div className="pt-2.5 space-y-2 border-t border-slate-100">
                  {/* Comments list */}
                  {post.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-2.5 rounded-xl bg-slate-50 text-xs space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{comment.authorName}</span>
                        <span className="text-[10px] text-slate-400">{comment.createdAt}</span>
                      </div>
                      <p className="text-slate-600">{comment.content}</p>
                    </div>
                  ))}

                  {/* Add comment input */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment(post.id);
                      }}
                      placeholder="Cheer on or ask a question..."
                      className="flex-1 p-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl active:scale-95 transition-all shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Share Your Story Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-500" />
                <h3 className="font-black text-sm text-slate-900">Share Your Journey Story</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              {/* Category */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Topic Category
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['Fat Loss', 'Diet & Recipes', 'Muscle Gain', 'Consistency'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPostTag(cat)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                        postTag === cat
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-400 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Headline / Story Title
                </label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. Down 6kg in 10 weeks: What finally worked for me"
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              {/* Transformation Story */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Your Story, Routine & Advice
                </label>
                <textarea
                  rows={4}
                  required
                  value={postStory}
                  onChange={(e) => setPostStory(e.target.value)}
                  placeholder="Share what changes you made, what foods you ate, how the AI tracking helped, and advice for fellow journey members..."
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                />
              </div>

              {/* Optional Milestone Stats */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Milestone Stats (Optional)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block">Start (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 82"
                      value={startWeight}
                      onChange={(e) => setStartWeight(e.target.value)}
                      className="w-full p-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Current (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={currentWeight}
                      onChange={(e) => setCurrentWeight(e.target.value)}
                      className="w-full p-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Weeks</label>
                    <input
                      type="number"
                      placeholder="e.g. 10"
                      value={weeksTaken}
                      onChange={(e) => setWeeksTaken(e.target.value)}
                      className="w-full p-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="h-11 px-4 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 flex items-center justify-center transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                >
                  Publish Story to Community
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
