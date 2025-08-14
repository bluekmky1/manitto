export const fetchCommunityPosts = async ({ pageSize = 10 }) => {
  const response = await fetch(`/api/community?limit=${pageSize}`);
  if (!response.ok) throw new Error("Failed to fetch posts");
  return await response.json();
};
