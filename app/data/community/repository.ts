import { fetchCommunityPosts } from "./remoteDataSource";

export const communityRepository = {
  getPosts: async ({ pageSize = 10 }) => {
    try {
      // Supabase 우선, 실패시 REST API fallback
      try {
        const data = await fetchCommunityPosts({ pageSize });
        return { success: true, data };
      } catch {
        return { success: false, message: "Failed to fetch posts" };
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return { success: false, message };
    }
  },
};
