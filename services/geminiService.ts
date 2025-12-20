
import { GoogleGenAI } from "@google/genai";
import { VideoResult } from "../types";

export const analyzeWithGemini = async (query: string, data: VideoResult[], userApiKey?: string, categoryName?: string): Promise<string> => {
  // Use user-provided key or fall back to environment key
  const apiKey = userApiKey || process.env.API_KEY || "";
  if (!apiKey) throw new Error("Gemini API 키가 설정되지 않았습니다.");
  
  const ai = new GoogleGenAI({ apiKey });
  
  const totalViews = data.reduce((acc, curr) => acc + curr.viewCount, 0);
  const avgViews = Math.round(totalViews / data.length);
  const topTags = Array.from(new Set(data.flatMap(v => v.tags))).slice(0, 15).join(", ");
  const maxViews = Math.max(...data.map(v => v.viewCount));

  // 쿼리가 있으면 키워드 분석, 없으면 카테고리 트렌드 분석
  const analysisTarget = query 
    ? `유튜브 키워드 '${query}' 심층 시장 분석` 
    : `'${categoryName || '전체'}' 카테고리 실시간 인기 트렌드 분석`;

  const prompt = `
    ${analysisTarget} 보고서:
    
    1. 데이터 지표:
    - 분석 영상 수: ${data.length}개
    - 총 누적 조회수: ${totalViews.toLocaleString()}회
    - 평균 조회수: ${avgViews.toLocaleString()}회
    - 최고 조회수: ${maxViews.toLocaleString()}회
    - 핵심 태그: ${topTags}

    2. 요청 사항 (마크다운 형식으로 작성):
    - ${query ? `이 키워드의 현재 '시장 규모'와 '검색 트렌드'를 평가해줘.` : `이 카테고리에서 현재 가장 인기 있는 '콘텐츠 유형'과 '트렌드'를 분석해줘.`}
    - 평균 조회수와 경쟁 영상들의 품질을 바탕으로 '경쟁 강도(상/중/하)'를 분석해줘.
    - ${query ? `신규 유튜버가 이 키워드로 진입할 때` : `신규 유튜버가 이 카테고리의 현재 트렌드에 편승하기 위해`} 필요한 '차별화 전략' 3가지를 제시해줘.
    - 추천하는 영상 제목 스타일과 썸네일 컨셉을 제안해줘.
    
    답변은 전문적이고 분석적인 톤으로, 한국어로 작성해줘.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "분석 데이터를 생성할 수 없습니다.";
  } catch (error) {
    console.error(error);
    throw new Error("Gemini API 호출 중 오류가 발생했습니다. 키가 유효한지 확인하세요.");
  }
};

export const summarizeVideo = async (title: string, description: string, userApiKey?: string): Promise<string> => {
  const apiKey = userApiKey || process.env.API_KEY || "";
  if (!apiKey) return "API 키가 없어 요약할 수 없습니다.";
  
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `다음 유튜브 영상의 핵심 내용을 3줄 요약하고, 시청 포인트 1가지를 짚어줘:\n제목: ${title}\n설명: ${description.substring(0, 800)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "요약 실패";
  } catch (error) {
    return "AI 요약 중 오류가 발생했습니다.";
  }
};
