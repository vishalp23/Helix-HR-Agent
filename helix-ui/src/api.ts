import axios from "axios";

const BASE_URL = "http://localhost:5000/api"; // Flask Backend

export interface OutreachResponse {
  initialMessage: string;
}

export interface Candidate {
  name: string;
  role: string;
  outreach_status: string;
}

// 🎯 API: Get AI-Generated Outreach Message
export const fetchOutreachSequence = async (role: string, approach: string): Promise<OutreachResponse> => {
  const response = await axios.post<OutreachResponse>(`${BASE_URL}/llm/outreach`, { role, approach });
  return response.data;
};

// 🎯 API: Store Candidate in Database
export const storeCandidate = async (candidate: Candidate): Promise<{ message: string }> => {
  const response = await axios.post<{ message: string }>(`${BASE_URL}/candidate`, candidate);
  return response.data;
};
