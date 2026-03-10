const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

// Read API Key from environment variable (set in Render dashboard)
const API_KEY = process.env.DEEPSEEK_API_KEY;
const API_URL = 'api.deepseek.com';

// CORS configuration - allow GitHub Pages and local development
const allowedOrigins = [
    'https://a18515373115-droid.github.io',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:8080'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Travel API is running 🚀' });
});

// Generate travel itinerary endpoint
app.post('/api/generate', (req, res) => {
    const { city } = req.body;

    if (!city) {
        return res.status(400).json({ error: 'City name is required' });
    }

    if (!API_KEY) {
        console.error('DEEPSEEK_API_KEY environment variable is not set!');
        return res.status(500).json({ error: 'Server configuration error: API key not set' });
    }

    console.log(`[${new Date().toISOString()}] Generating itinerary for: ${city}`);

    const prompt = `为${city}生成3天旅行攻略，仅返回JSON，不要其他文字。格式如下：
{"desc":"一句诗意的城市描述","overview":[{"icon":"🏙️","label":"城市标签","value":"值"},{"icon":"🌡️","label":"最佳时节","value":"值"},{"icon":"💰","label":"人均预算","value":"值"},{"icon":"🚇","label":"出行方式","value":"值"}],"days":[{"theme":"主题词·描述","schedule":[{"time":"08:00","icon":"🌅","title":"真实景点名","desc":"50字内描述"},{"time":"10:00","icon":"🏛️","title":"景点","desc":"描述"},{"time":"12:00","icon":"🍜","title":"午餐·真实餐厅名","desc":"推荐菜品"},{"time":"14:00","icon":"🎨","title":"景点","desc":"描述"},{"time":"16:30","icon":"🏮","title":"景点","desc":"描述"},{"time":"18:30","icon":"🍲","title":"晚餐·真实餐厅名","desc":"推荐菜品"}]}],"tips":[{"icon":"🎫","title":"标题","text":"30字内实用建议"}]}
要求：1.全部中文 2.使用真实地名和餐厅名 3.每天6个行程 4.共4条贴士 5.3天覆盖不同区域主题`;

    const requestData = JSON.stringify({
        model: 'deepseek-chat',
        messages: [
            { role: 'system', content: 'You are a helpful travel planning assistant. Always respond with valid JSON only.' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000
    });

    const options = {
        hostname: API_URL,
        port: 443,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Length': Buffer.byteLength(requestData)
        }
    };

    const apiReq = https.request(options, (apiRes) => {
        let data = '';

        apiRes.on('data', (chunk) => {
            data += chunk;
        });

        apiRes.on('end', () => {
            try {
                console.log(`[${new Date().toISOString()}] API response received, status: ${apiRes.statusCode}`);
                const response = JSON.parse(data);

                if (response.error) {
                    console.error('API Error:', response.error);
                    return res.status(500).json({ error: 'AI API error', detail: response.error.message });
                }

                const content = response.choices[0].message.content;

                // Extract JSON from response
                let jsonStr = content;
                const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
                if (jsonMatch) {
                    jsonStr = jsonMatch[1];
                }
                const braceMatch = jsonStr.match(/\{[\s\S]*\}/);
                if (braceMatch) {
                    jsonStr = braceMatch[0];
                }

                const itinerary = JSON.parse(jsonStr);
                console.log(`[${new Date().toISOString()}] Successfully generated itinerary for: ${city}`);
                res.json({ success: true, data: itinerary });

            } catch (error) {
                console.error('Parse error:', error.message);
                console.error('Raw response:', data.substring(0, 500));
                res.status(500).json({ error: 'Failed to parse AI response' });
            }
        });
    });

    // 120 second timeout (DeepSeek API may take 60-90s on cold start)
    apiReq.setTimeout(120000, () => {
        console.error(`[${new Date().toISOString()}] API request timeout for: ${city}`);
        apiReq.destroy();
        if (!res.headersSent) {
            res.status(504).json({ error: 'AI API request timeout. Please try again.' });
        }
    });

    apiReq.on('error', (error) => {
        console.error(`[${new Date().toISOString()}] Request error:`, error.message);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to connect to AI API', detail: error.message });
        }
    });

    apiReq.write(requestData);
    apiReq.end();
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Travel API server running on port ${PORT}`);
    console.log(`API Key configured: ${API_KEY ? 'Yes ✅' : 'No ❌'}`);
});
