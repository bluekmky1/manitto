import type { CommunityPostModel } from "../../domain/community/models/communityPostModel";
import { LoadingStatus } from "../../core/loadingStatus";

export interface CommunityState {
  // 상태
  getCommunityListLoadingStatus: LoadingStatus;
  communityList: CommunityPostModel[];
  communityErrorMessage?: string | null;
  // 함수
  fetchCommunityPosts: () => Promise<void>;
  onPostDeleted: (postId: string) => void;
  onCommentCreated: (postId: string) => void;
  onCommentDeleted: (postId: string) => void;
}
