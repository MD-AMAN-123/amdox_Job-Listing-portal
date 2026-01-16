import { GoogleGenAI, Type } from "@google/genai";
import { Job, User } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateJobDescription = async (title: string, company: string, skills: string): Promise<{ description: string, requirements: string[] }> => {
  try {
    const prompt = `
      Write a professional and engaging job description for a "${title}" position at "${company}".
      The role involves the following key skills or focus areas: ${skills}.
      
      Return the response in JSON format with two fields:
      1. "description": A 2-3 paragraph summary of the role, responsibilities, and why it's exciting.
      2. "requirements": An array of strings listing 5-7 bullet points for qualifications.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            requirements: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating job description:", error);
    return {
      description: "We are looking for a talented individual to join our team. Please apply if you have relevant experience.",
      requirements: ["Relevant experience in the field", "Strong communication skills", "Team player"]
    };
  }
};

export const enhanceCoverLetter = async (currentText: string, jobTitle: string): Promise<string> => {
   try {
    const prompt = `
      Rewrite the following cover letter draft to be more professional and tailored for a "${jobTitle}" position. 
      Keep it concise (under 200 words).
      
      Draft: "${currentText}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || currentText;
  } catch (error) {
    console.error("Error enhancing cover letter:", error);
    return currentText;
  }
}

export const recommendJobs = async (user: User, allJobs: Job[]): Promise<{ jobId: string, reason: string }[]> => {
  try {
    // Filter down data to save tokens and avoid passing unnecessary info
    const simplifiedJobs = allJobs.map(j => ({
      id: j.id,
      title: j.title,
      description: j.description.substring(0, 200), // First 200 chars
      tags: j.tags
    }));

    const userProfile = {
      skills: user.skills || [],
      experience: user.experience || "",
      bio: user.bio || ""
    };

    const prompt = `
      Act as a career recruiter. 
      User Profile: ${JSON.stringify(userProfile)}
      Available Jobs: ${JSON.stringify(simplifiedJobs)}

      Recommend the top 3 most relevant jobs for this user based on their skills and experience.
      Return JSON as an array of objects with "jobId" and a short "reason" (1 sentence) for the recommendation.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              jobId: { type: Type.STRING },
              reason: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    return text ? JSON.parse(text) : [];
  } catch (error) {
    console.error("Error recommending jobs:", error);
    return [];
  }
};

export const recommendCandidates = async (job: Job, candidates: User[]): Promise<{ userId: string, matchScore: number, reason: string }[]> => {
  try {
    const simplifiedCandidates = candidates.map(c => ({
      id: c.id,
      name: c.name,
      skills: c.skills || [],
      experience: c.experience || "",
      bio: c.bio || ""
    }));

    const jobProfile = {
      title: job.title,
      requirements: job.requirements,
      tags: job.tags
    };

    const prompt = `
      Act as a HR specialist.
      Job Requirement: ${JSON.stringify(jobProfile)}
      Candidates: ${JSON.stringify(simplifiedCandidates)}

      Identify the top candidates who match this job.
      Return JSON as an array of objects with:
      - "userId": string
      - "matchScore": number (0-100)
      - "reason": string (brief explanation of fit)
      
      Only return candidates with a matchScore > 50.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              userId: { type: Type.STRING },
              matchScore: { type: Type.NUMBER },
              reason: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    return text ? JSON.parse(text) : [];
  } catch (error) {
    console.error("Error recommending candidates:", error);
    return [];
  }
};