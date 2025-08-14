import { communityRepository } from "../../../data/community/repository";

export const getCommunityPosts = async ({ pageSize = 10 }) => {
  // const result = await communityRepository.getPosts({ pageSize });
  // if (result.success) return result.data;
  // throw new Error(result.message);
  return [
    {
      id: "1",
      title: "Hello",
      content: "Hello",
      createdAt: "2021-01-01",
      commentCount: 0,
    },

    {
      id: "2",
      title: "Hello",
      content: "Hello",
      createdAt: "2021-01-01",
      commentCount: 0,
    },

    {
      id: "3",
      title: "Hello",
      content: "Hello",
      createdAt: "2021-01-01",
      commentCount: 0,
    },
  ];
};
