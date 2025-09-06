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
    <div className={`${isReply ? 'ml-8 border-l-2 border-gray-700 pl-4' : ''}`}>
      <div className="flex space-x-3">
        <Image
          src={comment.user.avatar}
          alt={comment.user.name}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-white">{comment.user.name}</span>
            <span className="text-gray-400 text-sm">{comment.timestamp}</span>
          </div>
          <p className="text-gray-300 mt-1">{comment.content}</p>
          
          <div className="flex items-center space-x-4 mt-2">
            <button
              onClick={() => handleLike(comment.id)}
              className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
            >
              {likedComments.has(comment.id) ? (
                <HandThumbUpSolid className="h-4 w-4 text-blue-500" />
              ) : (
                <HandThumbUpIcon className="h-4 w-4" />
              )}
              <span className="text-sm">{comment.likes}</span>
            </button>
            
            <button
              onClick={() => handleDislike(comment.id)}
              className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
            >
              {dislikedComments.has(comment.id) ? (
                <HandThumbDownSolid className="h-4 w-4 text-red-500" />
              ) : (
                <HandThumbDownIcon className="h-4 w-4" />
              )}
              <span className="text-sm">{comment.dislikes}</span>
            </button>
            
            {!isReply && (
              <button className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors">
                <ChatBubbleLeftIcon className="h-4 w-4" />
                <span className="text-sm">Trả lời</span>
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
    <div className="bg-gray-900 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <ChatBubbleLeftIcon className="h-6 w-6 mr-2" />
          Bình luận ({comments.length})
        </h3>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="popular">Phổ biến</option>
        </select>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex space-x-3">
          <Image
            src="/placeholder-avatar.jpg"
            alt="Your avatar"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận của bạn..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
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
      <div className="text-center mt-6">
        <button className="text-red-400 hover:text-red-300 font-medium">
          Xem thêm bình luận
        </button>
      </div>
    </div>
  );
}
