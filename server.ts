import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Support large base64 image uploads (e.g. photos/screenshots)
  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ limit: '30mb', extended: true }));

  // Initialize server-side Gemini client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // AI-powered Property Image Recognition API Endpoint with Multi-Model Fallback
  app.post('/api/recognize-property', async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: '未提供图片数据' });
      }

      // Clean base64 string
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

      const prompt = `你是一名资深的中国房产中介与房源数字化分析专家。请仔细阅读并识别这张房源截图（可能来自贝壳找房、链家、安居客、房天下、微信房源海报或实勘照片），精准提取并结构化房源的全部核心数据。

请以严格的 JSON 格式输出，包含以下字段：
{
  "community": "小区名称，例如 中海左岸岚庭、华发新城、仁恒滨海半岛",
  "title": "根据房源卖点生成专业吸引人的房源标题，例如：中海左岸岚庭 3室2厅 正南向 满五年带电梯",
  "district": "所在行政区域及板块，如：金湾区 / 航空新城、香洲区 / 南湾、高新区 / 唐家湾、斗门区 / 湖心路 等",
  "type": "sale 或 rent（买卖房源填 sale，租房填 rent）",
  "price": 数字，总售价（单位万元，如128）或月租金（元/月），纯数字不要带单位,
  "unitPrice": 数字或null，折合单价（元/㎡），如 13111,
  "rooms": 纯数字，居室室数，如 3,
  "livingRooms": 纯数字，客厅数，如 2,
  "bathrooms": 纯数字，卫生间数，如 2,
  "area": 纯数字，建筑面积（㎡），如 97.63,
  "floor": "low（低楼层）、middle（中楼层）或 high（高楼层）",
  "totalFloors": 纯数字，总楼层数，如 25,
  "hasElevator": true 或 false（是否有电梯，配备电梯为 true）,
  "orientation": "朝向，如 纯南向、南北通透、东南、东",
  "decoration": "refined（精装修）、luxury（豪华装修）、simple（普通装修）或 rough（毛坯）",
  "tags": ["核心标签数组，如：航空新城、带电梯、满五年、纯南向、近学校、低总价 等最多6个"],
  "highlights": "综合房源核心优势提炼的简明卖点介绍（100字以内），涵盖户型方正度、采光朝向、周边配套、产权情况等",
  "ownerName": "房东或带看经纪人姓名，如果截图中有则填入，无则填 '业主/经纪人'",
  "ownerPhone": "联系电话，如果有则填入（如4008610586转29612），无则填 ''",
  "minPrice": 数字或null，预估心理底价，无则填 null
}

重要规则：
1. 优先提取图片中的明确文字与数字（如：户型：3室2厅2卫、面积：97.63㎡、售价：128万、单价：13111元/平、小区：中海左岸岚庭、区域：金湾区 航空新城、配备电梯：有、房屋年限：满五年 等）。
2. 只返回合法的标准 JSON，不要包含任何多余文字或注释。`;

      const imagePart = {
        inlineData: {
          mimeType: mimeType || 'image/png',
          data: cleanBase64,
        },
      };

      // Multi-model fallback list in case of 503 high-demand spikes
      const candidateModels = [
        'gemini-3.1-flash-lite',
        'gemini-flash-latest',
        'gemini-3.8-flash',
      ];

      let lastError: any = null;
      let responseText: string | null = null;

      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: {
              parts: [imagePart, { text: prompt }],
            },
            config: {
              responseMimeType: 'application/json',
            },
          });

          if (response.text) {
            responseText = response.text;
            break; // Succeeded!
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`Model ${model} failed with:`, err.message || err);
          // Continue to next model in fallback array
        }
      }

      if (!responseText) {
        throw lastError || new Error('所有 AI 识别模型通道均暂时繁忙，请稍后重试');
      }

      // Clean markdown code blocks if present
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
      const parsedData = JSON.parse(cleanJson);

      return res.json({
        success: true,
        data: parsedData,
      });
    } catch (error: any) {
      console.error('Property image recognition error:', error);
      let userFriendlyMsg = '识别房源截图信息失败，请稍后重试';
      const errMsg = error.message || '';
      if (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE')) {
        userFriendlyMsg = 'AI 服务瞬时负载较高，请再次点击识别重试即可';
      }
      return res.status(500).json({
        error: userFriendlyMsg,
      });
    }
  });

  // Mount Vite or serve static dist
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, server.js runs from dist, so static files are in process.cwd()/dist or __dirname
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server started on port ${port}`);
  });
}

startServer();
