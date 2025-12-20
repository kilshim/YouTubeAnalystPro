
import { GoogleGenAI, SchemaType } from "@google/genai";
import { VideoResult } from "../types";

export const analyzeWithGemini = async (query: string, data: VideoResult[], userApiKey?: string, categoryName?: string): Promise<string> => {
  const apiKey = userApiKey || process.env.API_KEY || "";
  if (!apiKey) throw new Error("Gemini API 키가 설정되지 않았습니다.");
  
  const ai = new GoogleGenAI({ apiKey });
  
  const totalViews = data.reduce((acc, curr) => acc + curr.viewCount, 0);
  const avgViews = Math.round(totalViews / data.length);
  const topTags = Array.from(new Set(data.flatMap(v => v.tags))).slice(0, 15).join(", ");
  const maxViews = Math.max(...data.map(v => v.viewCount));

  const analysisTarget = query 
    ? `유튜브 키워드 '${query}' 심층 시장 분석` 
    : `'${categoryName || '전체'}' 카테고리 실시간 인기 트렌드 분석`;

  const prompt = `
    [분석 대상: ${analysisTarget}]
    
    [데이터 지표]
    - 분석 영상 수: ${data.length}개
    - 총 누적 조회수: ${totalViews.toLocaleString()}회
    - 평균 조회수: ${avgViews.toLocaleString()}회
    - 최고 조회수: ${maxViews.toLocaleString()}회
    - 핵심 태그(원본): ${topTags}

    [분석 요청 사항]
    위 데이터를 바탕으로 심층 시장 분석 보고서를 **반드시 한국어(Korean)**로 작성해 주세요.
    분석 대상이 해외 콘텐츠인 경우, 한국 시장 및 크리에이터 관점에서 해석하고 적용할 수 있는 인사이트를 제공해야 합니다.

    1. 📊 트렌드 및 콘텐츠 분석
    - 현재 이 주제/카테고리가 왜 인기가 있는지, 글로벌/로컬 시청자들이 반응하는 핵심 요소(포맷, 연출, 소재 등)를 분석하세요.
    
    2. 📉 시장 규모 및 경쟁 강도
    - 조회수 분포를 기반으로 시장의 규모(대중성 vs 니치)와 경쟁 강도(레드오션/블루오션)를 평가하세요.
    
    3. 💡 한국 크리에이터를 위한 벤치마킹 전략
    - 신규 유튜버가 이 트렌드에 진입하거나 벤치마킹할 때 사용할 수 있는 구체적인 차별화 전략 3가지를 제안하세요.
    - (해외 트렌드인 경우) 한국 정서에 맞게 로컬라이징할 수 있는 아이디어를 포함하세요.
    
    4. 🎬 추천 콘텐츠 기획
    - 클릭률(CTR)을 높일 수 있는 매력적인 **한국어 제목 예시 3개**
    - 시선을 사로잡는 썸네일 구성 및 디자인 컨셉
    
    작성 톤앤매너: 전문적인 데이터 분석가/마케팅 컨설턴트 톤.
    형식: 가독성 좋은 마크다운(Markdown) (## 소제목, - 리스트, **강조** 활용).
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

  // 해외 영상일 경우에도 한국어로 요약하도록 명시
  const prompt = `다음 유튜브 영상의 핵심 내용을 한국어로 3줄 요약하고, 시청 포인트 1가지를 짚어줘:\n제목: ${title}\n설명: ${description.substring(0, 800)}\n\n반드시 한국어로 답변해줘.`;

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

// 영상 제목 일괄 번역 (해외 영상용)
export const translateTitles = async (videos: VideoResult[], userApiKey?: string): Promise<VideoResult[]> => {
  const apiKey = userApiKey || process.env.API_KEY || "";
  if (!apiKey || videos.length === 0) return videos;

  const ai = new GoogleGenAI({ apiKey });

  // 번역 대상 추출 (ID와 제목만)
  const itemsToTranslate = videos.map(v => ({ id: v.id, title: v.title }));
  
  const prompt = `
    You are a professional translator for YouTube content.
    Translate the following YouTube video titles into natural, click-worthy Korean (Hangul).
    Keep the original meaning but make it sound like a native Korean YouTube title.
    
    Input JSON:
    ${JSON.stringify(itemsToTranslate)}

    Output Requirement:
    Return a JSON array of objects with "id" and "translatedTitle".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const jsonText = response.text || "[]";
    const translatedItems: { id: string; translatedTitle: string }[] = JSON.parse(jsonText);
    
    // 번역 결과를 원본 데이터와 병합
    const translationMap = new Map(translatedItems.map(i => [i.id, i.translatedTitle]));

    return videos.map(v => ({
      ...v,
      originalTitle: v.title, // 원본 제목 저장
      title: translationMap.get(v.id) || v.title // 번역 실패 시 원본 유지
    }));

  } catch (error) {
    console.error("Translation failed:", error);
    return videos; // 에러 발생 시 원본 반환
  }
};

// 키워드(태그) 일괄 번역 (해외 트렌드용)
export const translateKeywords = async (tags: string[], userApiKey?: string): Promise<string[]> => {
  const apiKey = userApiKey || process.env.API_KEY || "";
  if (!apiKey || tags.length === 0) return tags;

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Translate the following YouTube tags/keywords into natural Korean.
    If the keyword is a proper noun (like a game name 'Minecraft', brand 'Samsung'), keep it in English OR provide the common Korean transliteration.
    For general words (e.g. 'Funny', 'Vlog'), translate them to Korean.
    
    Input List: ${JSON.stringify(tags)}
    
    Output Requirement:
    Return ONLY a JSON array of strings containing the translated keywords.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    const jsonText = response.text || "[]";
    const translated = JSON.parse(jsonText);
    return Array.isArray(translated) ? translated : tags;
  } catch (e) {
    return tags;
  }
};
