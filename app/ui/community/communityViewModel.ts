import { create } from "zustand";
import type { CommunityState } from "./communityState";
import { LoadingStatus } from "../../core/loadingStatus";
import { getCommunityPosts } from "../../domain/community/usecases/getCommunityPosts";

export const useCommunityStore = create<CommunityState>((set, get) => ({
  getCommunityListLoadingStatus: LoadingStatus.None,
  communityList: [],
  communityErrorMessage: null,

  fetchCommunityPosts: async () => {
    set({ getCommunityListLoadingStatus: LoadingStatus.Loading });
    try {
      const communityList = await getCommunityPosts({ pageSize: 3 });
      set({
        getCommunityListLoadingStatus: LoadingStatus.Success,
        communityList,
        communityErrorMessage: null,
      });
    } catch (e) {
      set({
        getCommunityListLoadingStatus: LoadingStatus.Error,
        communityErrorMessage: "불러오기 실패",
      });
    }
  },

  onPostDeleted: (postId) => {
    const { communityList } = get();
    if (communityList.some((post) => post.id === postId)) {
      get().fetchCommunityPosts();
    }
  },

  onCommentCreated: (postId) => {
    set((state) => ({
      communityList: state.communityList.map((post) =>
        post.id === postId
          ? { ...post, commentCount: post.commentCount + 1 }
          : post
      ),
    }));
  },

  onCommentDeleted: (postId) => {
    set((state) => ({
      communityList: state.communityList.map((post) =>
        post.id === postId
          ? { ...post, commentCount: post.commentCount - 1 }
          : post
      ),
    }));
  },
}));
