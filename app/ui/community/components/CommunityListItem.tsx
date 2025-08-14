import React from "react";

export function CommunityListItem({ post }: { post: any }) {
  return (
    <div>
      <div className="font-semibold text-lg text-gray-800 truncate">
        {post.title}
      </div>
      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
        <span>{post.author ?? "익명"}</span>
        <span>·</span>
        <span>{post.createdAt ?? "-"}</span>
        <span>·</span>
        <span>댓글 {post.commentCount ?? 0}</span>
      </div>
      {post.content && (
        <div className="mt-2 text-gray-700 text-sm line-clamp-2">
          {post.content}
        </div>
      )}
    </div>
  );
}
