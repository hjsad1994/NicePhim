'use client';

import { useState } from 'react';
import Image from 'next/image';
import { HandThumbUpIcon, HandThumbDownIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolid, HandThumbDownIcon as HandThumbDownSolid } from '@heroicons/react/24/solid';

interface Comment {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  dislikes: number;
  replies?: Comment[];
}

interface VideoCommentsProps {
  movieId: string;
}

export function VideoComments({ }: VideoCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Mock comments data
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      user: { name: 'Nguyễn Văn A', avatar: '/placeholder-avatar.jpg' },
      content: 'Phim hay quá! Diễn xuất của các diễn viên rất tuyệt vời. Đặc biệt là cảnh hành động ở phút thứ 45.',
      timestamp: '2 giờ trước',
      likes: 15,
      dislikes: 2,
      replies: [
        {
          id: '1-1',
          user: { name: 'Trần Thị B', avatar: '/placeholder-avatar.jpg' },
          content: 'Mình cũng thích cảnh đó! Hiệu ứng CGI rất chất lượng.',
          timestamp: '1 giờ trước',
          likes: 8,
          dislikes: 0
        }
      ]
    },
    {
      id: '2',
      user: { name: 'Lê Minh C', avatar: '/placeholder-avatar.jpg' },
      content: 'Chất lượng phim tốt, phụ đề chính xác. Cảm ơn NicePhim đã cung cấp nguồn phim chất lượng!',
      timestamp: '4 giờ trước',
      likes: 23,
      dislikes: 1
    },
    {
      id: '3',
      user: { name: 'Phạm Thu D', avatar: '/placeholder-avatar.jpg' },
      content: 'Soundtrack của phim này rất hay, ai biết tên bài hát ở phút 30 không?',
      timestamp: '6 giờ trước',
      likes: 7,
      dislikes: 0
    }
  ]);

  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [dislikedComments, setDislikedComments] = useState<Set<string>>(new Set());

  const handleLike = (commentId: string) => {
    const newLiked = new Set(likedComments);
    const newDisliked = new Set(dislikedComments);
    
    if (likedComments.has(commentId)) {
      newLiked.delete(commentId);
    } else {
      newLiked.add(commentId);
      newDisliked.delete(commentId); // Remove dislike if exists
    }
    
    setLikedComments(newLiked);
    setDislikedComments(newDisliked);
  };

  const handleDislike = (commentId: string) => {
    const newLiked = new Set(likedComments);
    const newDisliked = new Set(dislikedComments);
    
    if (dislikedComments.has(commentId)) {
      newDisliked.delete(commentId);
    } else {
      newDisliked.add(commentId);
      newLiked.delete(commentId); // Remove like if exists
    }
    
    setLikedComments(newLiked);
    setDislikedComments(newDisliked);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      user: { name: 'Bạn', avatar: '/placeholder-avatar.jpg' },
      content: newComment,
      timestamp: 'Vừa xong',
      likes: 0,
      dislikes: 0
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-8 border-l-2 border-white/10 pl-6' : ''}`}>
      <div className="flex gap-3 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all">
        <Image
          src={comment.user.avatar}
          alt={comment.user.name}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
        />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white">{comment.user.name}</span>
            <span className="text-rose-300/60 text-xs font-medium">{comment.timestamp}</span>
          </div>
          <p className="text-white/90 mt-2 leading-relaxed">{comment.content}</p>
          
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => handleLike(comment.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white transition-all"
            >
              {likedComments.has(comment.id) ? (
                <HandThumbUpSolid className="h-4 w-4 text-white" />
              ) : (
                <HandThumbUpIcon className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">{comment.likes}</span>
            </button>
            
            <button
              onClick={() => handleDislike(comment.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white transition-all"
            >
              {dislikedComments.has(comment.id) ? (
                <HandThumbDownSolid className="h-4 w-4 text-white" />
              ) : (
                <HandThumbDownIcon className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">{comment.dislikes}</span>
            </button>
            
            {!isReply && (
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white transition-all">
                <ChatBubbleLeftIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Trả lời</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-black flex items-center gap-2 text-white">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center">
            <ChatBubbleLeftIcon className="h-5 w-5 text-rose-400" />
          </div>
          Bình luận ({comments.length})
        </h3>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 hover:border-white/20 transition-colors"
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="popular">Phổ biến</option>
        </select>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-8">
        <div className="flex gap-3">
          <Image
            src="/placeholder-avatar.jpg"
            alt="Your avatar"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận của bạn..."
              className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/30 resize-none transition-all"
              rows={3}
            />
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg disabled:shadow-none"
              >
                Gửi bình luận
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium rounded-xl transition-all duration-300">
          Xem thêm bình luận ↓
        </button>
      </div>
    </div>
  );
}
