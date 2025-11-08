import { GoogleGenAI } from "@google/genai";

export interface Idea {
  id: string;
  score: number;
  title: string;
  description: string;
  originalLine: string;
}

const TITLE_CASE_STYLES = {
    sentence: 'حالة الجملة (Sentence Case)',
    title: 'حالة العنوان (Title Case)',
    allcaps: 'أحرف كبيرة (ALL CAPS)',
};

const buildPrompt = (
    niches: string, 
    ideaCount: number, 
    positivePrompt: string, 
    negativePrompt: string,
    titleCaseStyle: string
): string => {
    let prompt = `
    بصفتك خبير في تحسين محركات البحث (SEO) لمنصة يوتيوب ومبتكر محتوى محترف.
    بناءً على النيتشات التالية: "${niches}"، قم بتوليد ${ideaCount} فكرة عنوان فريدة ومبتكرة لمقاطع فيديو يوتيوب.
    `;

    if (niches.includes('حضارات') || niches.includes('شخصيات تاريخية') || niches.includes('شخصيات اسلامية تاريخية')) {
        prompt += `
        توجيه خاص للمحتوى التاريخي:
        - إذا كان النيتش "حضارات"، يجب أن يكون الوصف عبارة عن ملخص شامل لتاريخ الحضارة من نشأتها إلى نهايتها، ويغطي أبرز المحطات.
        - إذا كان النيتش "شخصيات تاريخية" أو "شخصيات اسلامية تاريخية"، يجب أن يكون الوصف بمثابة سيرة ذاتية موجزة وشاملة للشخصية، تغطي حياتها وأهم إنجازاتها وتأثيرها.
        `;
    }

    if (positivePrompt.trim()) {
        prompt += `\nركز بشدة على تضمين هذه الكلمات أو المفاهيم: "${positivePrompt.trim()}".`;
    }
    if (negativePrompt.trim()) {
        prompt += `\nتجنب تمامًا ذكر هذه الكلمات أو المفاهيم: "${negativePrompt.trim()}".`;
    }

    prompt += `
    اتبع هذه القواعد بدقة شديدة:
    1.  لكل فكرة، يجب أن يكون الناتج على سطر واحد بالتنسيق التالي بالضبط: [تقييم SEO من 100] | [العنوان] | [وصف موجز لا يزيد عن 30 كلمة].
    2.  مثال للتنسيق: 95 | أفضل 5 طرق لزيادة متابعينك | فيديو يشرح استراتيجيات عملية لنمو القناة باستخدام طرق مجانية ومبتكرة ومجربة.
    3.  افصل بين التقييم والعنوان والوصف باستخدام علامة "|" واحدة فقط. لا تستخدمها في أي مكان آخر.
    4.  لا تقم بإضافة أي ترقيم (مثل 1., 2., ...) أو علامات (- or *) أو رؤوس عناوين أو أي نص إضافي قبل أو بعد القائمة.
    5.  يجب أن تكون العناوين جذابة ومُحسَّنة لمحركات البحث (SEO).
    6.  يجب أن تكون الأفكار متنوعة وتغطي زوايا مختلفة وفريدة وغير مكررة للأفكار السابقة.
    7.  النتيجة يجب أن تكون ${ideaCount} سطراً، كل سطر يمثل فكرة مستقلة بالتنسيق المطلوب.
    8.  قم بتنسيق جميع العناوين بأسلوب "${TITLE_CASE_STYLES[titleCaseStyle as keyof typeof TITLE_CASE_STYLES]}".
    `;
    return prompt;
};

export const generateIdeas = async (
    niches: string,
    ideaCount: number,
    positivePrompt: string,
    negativePrompt: string,
    model: string,
    apiKey: string | null,
    titleCaseStyle: string
): Promise<Idea[]> => {
  if (!apiKey || apiKey === 'DEFAULT_API_KEY_PLACEHOLDER') {
    throw new Error("API Key is not set. Please add your own key in the settings.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: buildPrompt(niches, ideaCount, positivePrompt, negativePrompt, titleCaseStyle),
    });

    const text = response.text;
    if (!text) {
      return [];
    }
    
    const lines = text.split('\n').filter(line => line.trim() !== '' && line.includes('|'));
    
    const ideas: Idea[] = lines.map((line, index) => {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length < 3) return null;
        
        const score = parseInt(parts[0], 10);
        const title = parts[1];
        const description = parts.slice(2).join(' | ');

        if (isNaN(score) || !title || !description) return null;

        return {
            id: `${Date.now()}-${index}`,
            score,
            title,
            description,
            originalLine: `${title} | ${description}`
        };
    }).filter((idea): idea is Idea => idea !== null);

    ideas.sort((a, b) => b.score - a.score);
    return ideas;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
        throw new Error("مفتاح API المستخدم غير صالح. يرجى التحقق منه في الإعدادات.");
    }
    throw new Error("Failed to generate ideas from Gemini API.");
  }
};


export const fetchTrendingNiches = async (category: string, apiKey: string): Promise<string[]> => {
    if (!apiKey || apiKey === 'DEFAULT_API_KEY_PLACEHOLDER') {
        throw new Error("API Key is not set. Please add your own key in the settings to use this feature.");
    }
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
    As a YouTube trend expert, list the 10 most popular and currently trending sub-niches in Arabic within the category of '${category}'.
    Provide only a comma-separated list of the niche names. Do not add numbers, newlines, or any other text.
    Example: Niche1, Niche2, Niche3
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Use a fast model for this task
            contents: prompt,
        });
        const text = response.text;
        if (!text) return [];
        return text.split(',').map(n => n.trim()).filter(Boolean);
    } catch (error) {
        console.error("Error fetching trending niches:", error);
        throw new Error("Failed to fetch trending niches from Gemini API.");
    }
}