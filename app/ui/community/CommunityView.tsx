import React, { useEffect } from "react";
import { useCommunityStore } from "./communityViewModel";
import { CommunityListItem } from "./components/CommunityListItem";

export function CommunityView() {
  const { getCommunityListLoadingStatus, communityList, fetchCommunityPosts } =
    useCommunityStore();

  useEffect(() => {
    fetchCommunityPosts();
  }, [fetchCommunityPosts]);

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">커뮤니티</h2>
      {getCommunityListLoadingStatus === "loading" ? (
        <div className="text-center text-gray-500 py-8">Loading...</div>
      ) : communityList.length === 0 ? (
        <div className="text-center text-gray-400 py-8">게시글이 없습니다.</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {communityList.map((post) => (
            <li key={post.id} className="py-4 px-2 hover:bg-gray-50 transition">
              <CommunityListItem post={post} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
