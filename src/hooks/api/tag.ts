// @/hooks/api/tag.ts
import axios from "axios";

export async function getAllTags() {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tags`);
  return res.data;
}

export async function createTag(payload: { name: string }) {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/tags`,
    payload
  );
  return res.data;
}
