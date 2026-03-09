// ========== DOM Elements ==========
const cityInput = document.getElementById('cityInput');
const loading = document.getElementById('loading');
const result = document.getElementById('result');

// ========== Utility Functions ==========

// Select city from hot tags
function selectCity(city) {
    cityInput.value = city;
    generateItinerary();
}

// Enter key support
cityInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        generateItinerary();
    }
});

// Generate a random itinerary for unknown cities
function generateRandomItinerary(city) {
    const morningSpots = [
        { title: `${city}博物馆`, desc: `了解${city}的历史文化，感受当地的人文魅力` },
        { title: `${city}老城区`, desc: `漫步老街古巷，感受最地道的当地生活气息` },
        { title: `${city}公园`, desc: `在城市绿肺中晨练散步，呼吸清新空气` }
    ];
    const noonFood = [
        { title: `当地特色餐厅`, desc: `品尝${city}最地道的当地美食，感受舌尖上的城市味道` },
        { title: `老字号餐馆`, desc: `寻找${city}历史最悠久的老字号，品味传统滋味` },
        { title: `美食街`, desc: `在${city}最热闹的美食街大快朵颐，一站吃遍当地小吃` }
    ];
    const afternoonSpots = [
        { title: `${city}地标景点`, desc: `打卡${city}最具代表性的地标建筑，拍照留念` },
        { title: `当地寺庙/古迹`, desc: `探访历史古迹，感受岁月沉淀的文化底蕴` },
        { title: `${city}文创园`, desc: `在创意园区中发现艺术与生活的美好碰撞` },
        { title: `自然风景区`, desc: `走进${city}周边的自然风光，享受大自然的馈赠` }
    ];
    const eveningSpots = [
        { title: `夜游${city}`, desc: `华灯初上，欣赏${city}迷人的城市夜景` },
        { title: `当地夜市`, desc: `逛逛${city}最热闹的夜市，品尝各种宵夜美食` }
    ];

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const themes = [
        `初识${city} · 探索城市的第一印象`,
        `深度体验 · 感受${city}的人文魅力`,
        `休闲漫游 · ${city}的自然与美食`
    ];

    const days = themes.map((theme, i) => {
        const m = pick(morningSpots);
        const n = pick(noonFood);
        const a1 = pick(afternoonSpots);
        const a2 = pick(afternoonSpots.filter(x => x.title !== a1.title)) || pick(afternoonSpots);
        const e = pick(eveningSpots);
        return {
            theme,
            schedule: [
                { time: "09:00", icon: "🌅", title: m.title, desc: m.desc },
                { time: "12:00", icon: "🍜", title: `午餐 · ${n.title}`, desc: n.desc },
                { time: "14:00", icon: "🏛️", title: a1.title, desc: a1.desc },
                { time: "16:00", icon: "🎨", title: a2.title, desc: a2.desc },
                { time: "18:30", icon: "🌃", title: e.title, desc: e.desc },
                { time: "20:00", icon: "🍢", title: `晚餐 · ${city}特色餐厅`, desc: `用一顿丰盛的当地美食结束充实的一天` }
            ]
        };
    });

    return {
        desc: `一座值得探索的城市，等你来发现它的独特魅力`,
        overview: [
            { icon: "🏙️", label: "城市标签", value: "精彩目的地" },
            { icon: "🌡️", label: "最佳时节", value: "春秋最佳" },
            { icon: "💰", label: "人均预算", value: "2000-4000元" },
            { icon: "🚌", label: "出行方式", value: "公共交通" }
        ],
        days,
        tips: [
            { icon: "📱", title: "行前准备", text: `出发前了解${city}的天气和交通情况，提前预订住宿` },
            { icon: "💰", title: "预算建议", text: "合理规划预算，景点门票可在网上提前购买享受优惠" },
            { icon: "📷", title: "拍照打卡", text: "带好充电宝和自拍杆，记录旅途中的每一个精彩瞬间" },
            { icon: "🎒", title: "随身物品", text: "带好防晒用品、雨具和舒适的鞋子，做好万全准备" }
        ]
    };
}

// ========== Main Generate Function ==========
function generateItinerary() {
    const city = cityInput.value.trim();
    if (!city) {
        cityInput.focus();
        cityInput.style.animation = 'shake 0.5s';
        setTimeout(() => cityInput.style.animation = '', 500);
        return;
    }

    // Show loading
    result.style.display = 'none';
    loading.style.display = 'block';

    // Simulate loading delay
    setTimeout(() => {
        loading.style.display = 'none';
        
        // Get data (built-in or generated)
        const data = cityData[city] || generateRandomItinerary(city);
        
        renderResult(city, data);
        result.style.display = 'block';
        result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 1500);
}

// ========== Render Functions ==========
function renderResult(city, data) {
    // Header
    document.getElementById('resultTitle').textContent = `📍 ${city} · 3天旅行攻略`;
    document.getElementById('resultDesc').textContent = data.desc;

    // Overview Card
    const overviewCard = document.getElementById('overviewCard');
    overviewCard.innerHTML = `
        <h3 style="font-size:1.2rem;color:#333;margin-bottom:5px;">📋 城市概览</h3>
        <div class="overview-grid">
            ${data.overview.map(item => `
                <div class="overview-item">
                    <div class="icon">${item.icon}</div>
                    <div class="label">${item.label}</div>
                    <div class="value">${item.value}</div>
                </div>
            `).join('')}
        </div>
    `;

    // Timeline / Day Cards
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = data.days.map((day, index) => `
        <div class="day-card" style="animation-delay: ${index * 0.15}s">
            <div class="day-marker">D${index + 1}</div>
            <div class="day-header">
                <h3>第${index + 1}天</h3>
                <div class="day-theme">${day.theme}</div>
            </div>
            <div class="day-content">
                ${day.schedule.map(item => `
                    <div class="schedule-item">
                        <div class="schedule-time">${item.time}</div>
                        <div class="schedule-icon">${item.icon}</div>
                        <div class="schedule-info">
                            <h4>${item.title}</h4>
                            <p>${item.desc}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    // Tips Card
    const tipsCard = document.getElementById('tipsCard');
    tipsCard.innerHTML = `
        <h3>💡 实用小贴士</h3>
        <div class="tips-grid">
            ${data.tips.map(tip => `
                <div class="tip-item">
                    <div class="tip-icon">${tip.icon}</div>
                    <div class="tip-text">
                        <strong>${tip.title}</strong>
                        ${tip.text}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ========== Add shake animation ==========
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-8px); }
        75% { transform: translateX(8px); }
    }
`;
document.head.appendChild(style);
