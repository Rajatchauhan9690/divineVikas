import axios from "axios";

export const fetchSlotsApi = async () => {
  const res = await axios.get("/api/sessions");
  return res.data;
};
