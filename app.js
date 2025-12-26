// ==================== 1. 心理学产品数据库 ====================
const OLD_PATTERNS = [
    // 请将这段代码添加到 app.js 的 OLD_PATTERNS 数组中（建议放在第一位）
{
    id: '0', // 特殊ID，置顶显示
    name: '🚫 想象循环',
    desc: '想象她喜欢别人并自我贬低',
    why: '这是大脑的【威胁模拟系统】和【社会比较系统】联合过载。前额叶的理性判断被杏仁核的“社交威胁警报”劫持，导致你在心理上反复排练并不存在的失败场景。',
    stop: '物理中断：双手握拳10秒 → 松开，感受指尖触感 → 喝一口冷水',
    replace: '问自己：“这个想象是基于事实证据，还是基于我的不安全感编程？” → 写下1个客观事实（如：“我们没有在交往”）'
},
    {
        id: '1',
        name: '🧠 思维反刍',
        desc: '反复想同一件事',
        last: '2小时前',
        why: '这是「默认模式网络」过度活跃。就像大脑的自动驾驶系统在空转，反复走同一条老路。',
        stop: '站起来 → 做5次深蹲 → 喝一口水',
        replace: '问：此刻我能做的最小有效行动是什么？'
    },
    {
        id: '2',
        name: '😔 自我批判',
        desc: '对自己说苛刻的话',
        last: '昨天',
        why: '这是「前额叶内侧皮质」过度自我参照。过度关注自己的缺点，而非客观事实。',
        stop: '大声说出：停！现在，用你对好朋友的语气说话。',
        replace: '问：如果是我最好的朋友处在此情境，我会对他说什么？'
    },
    {
        id: '3',
        name: '🌪️ 灾难化思维',
        desc: '想象最坏情况',
        last: '3小时前',
        why: '这是「杏仁核」过度敏感。大脑的警报系统误判了威胁等级。',
        stop: '用冷水轻拍脸部 → 深呼吸（吸气4秒，屏息7秒，呼气8秒）',
        replace: '问：这个糟糕结果的实际概率是多少？基于什么证据？'
    },
    {
        id: '4',
        name: '⏰ 完美主义拖延',
        desc: '必须完美才行动',
        last: '5小时前',
        why: '这是「前扣带回」错误监控过度活跃。害怕犯错，导致行动瘫痪。',
        stop: '设置一个5分钟倒计时，立刻开始。',
        replace: '问：这个任务「最差但可接受」的版本是什么？'
    },
    {
        id: '5',
        name: '😰 社交焦虑',
        desc: '担心别人评价',
        last: '今天上午',
        why: '这是「镜像神经元」和「社会脑」系统过度解读他人信号。',
        stop: '双脚踩实地面，触摸自己的手腕，默念"此刻我是安全的"。',
        replace: '问：对方此刻可能在想什么与自己无关的琐事？'
    }
];

// ==================== 2. 数据存储与状态管理 ====================
const STORAGE_KEY = 'neuro_rewire_v1';
let records = [];
let currentStep = 0;
let currentPattern = null;
let moodBefore = 3;
let moodAfter = 3;

// 初始化：加载历史记录
function initApp() {
    loadRecords();
    renderPatternList();
    renderStatsPanel();
    renderRecordList();
}

function loadRecords() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        records = JSON.parse(stored);
    } else {
        records = [];
    }
    return records;
}

function saveRecords() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    updateQuickStats();
}

// ==================== 3. 界面渲染函数 ====================
// 渲染旧模式列表
function renderPatternList() {
    const container = document.getElementById('patternList');
    if (!container) return;
    
    container.innerHTML = OLD_PATTERNS.map(pattern => `
        <div class="pattern-card" onclick="startPatternFlow('${pattern.id}')">
            <div class="card-header">
                <div class="pattern-name">${pattern.name}</div>
                <div class="red-dot"></div>
            </div>
            <div class="pattern-desc">${pattern.desc}</div>
            <div class="last-time">上次：${pattern.last}</div>
        </div>
    `).join('');
}

// 渲染统计数据面板
function renderStatsPanel() {
    const stats = getStats();
    const container = document.getElementById('statsPanel');
    if (!container) return;
    
    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${stats.total}</div>
            <div class="stat-label">总重塑次数</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.today}</div>
            <div class="stat-label">今日次数</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.avgEffect > 0 ? '+' : ''}${stats.avgEffect}</div>
            <div class="stat-label">平均效果</div>
        </div>
        <div class="pattern-insight">
            <p><strong>📈 洞察</strong></p>
            <p>最常处理：${stats.topPattern}</p>
            <p>最佳时段：${stats.bestTime}</p>
        </div>
    `;
}

// 渲染最近记录列表
function renderRecordList() {
    const container = document.getElementById('recordList');
    if (!container) return;
    
    if (records.length === 0) {
        container.innerHTML = `<div class="empty-tip">暂无记录，点击上方模式卡片开始你的第一次重塑。</div>`;
        return;
    }
    
    const recent = records.slice(0, 5);
    container.innerHTML = recent.map(record => `
        <div class="record-item">
            <div class="record-text">✅ ${record.pattern} (${record.mood.before}→${record.mood.after})</div>
            <div class="record-time">${record.time}</div>
        </div>
    `).join('');
}

// 更新顶部快速统计
function updateQuickStats() {
    const stats = getStats();
    const todayEl = document.getElementById('today-count');
    const totalEl = document.getElementById('total-count');
    if (todayEl) todayEl.textContent = `今日：${stats.today}`;
    if (totalEl) totalEl.textContent = `总计：${stats.total}`;
}

// ==================== 4. 核心业务流程 ====================
// 开始处理一个旧模式
function startPatternFlow(patternId) {
    currentPattern = OLD_PATTERNS.find(p => p.id === patternId);
    currentStep = 1;
    moodBefore = 3;
    moodAfter = 3;
    showStepModal();
}

// 显示步骤模态窗
function showStepModal() {
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    
    let stepContent = '';
    const stepTitles = ['原理解释', '中断执行', '建立新连接', '记录完成'];
    
    if (currentStep === 1) {
        // 第一步：原理解释 + 心情选择
        stepContent = `
            <h3 class="modal-title">🎯 ${currentPattern.name}</h3>
            <div class="modal-body">
                <div class="modal-step">
                    <div class="step-title">💡 神经原理</div>
                    <p>${currentPattern.why}</p>
                </div>
                <div class="modal-step">
                    <div class="step-title">📊 记录你的初始心情 (1-5分)</div>
                    <div class="mood-selector">
                        ${[1, 2, 3, 4, 5].map(num => `
                            <button class="mood-btn ${moodBefore === num ? 'selected' : ''}" 
                                    onclick="selectMoodBefore(${num})">
                                ${num === 1 ? '😫' : num === 2 ? '😔' : num === 3 ? '😐' : num === 4 ? '🙂' : '😊'}
                            </button>
                        `).join('')}
                    </div>
                    <div style="text-align: center; font-size: 0.9rem; color: #666; margin-top: 0.5rem;">
                        ${moodBefore === 1 ? '很糟' : moodBefore === 2 ? '不佳' : moodBefore === 3 ? '一般' : moodBefore === 4 ? '不错' : '很好'}
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button class="modal-btn btn-secondary" onclick="closeModal()">取消</button>
                <button class="modal-btn btn-primary" onclick="nextStep()">我懂了，下一步</button>
            </div>
        `;
    } else if (currentStep === 2) {
        // 第二步：中断方法
        stepContent = `
            <h3 class="modal-title">⚡ 立即中断！</h3>
            <div class="modal-body">
                <div class="modal-step">
                    <div class="step-title">【执行这个动作】</div>
                    <p style="font-size: 1.1rem; padding: 0.5rem 0;">${currentPattern.stop}</p>
                    <p style="color: #666; font-size: 0.9rem;">⏱️ 只需15秒，立即去做！</p>
                </div>
            </div>
            <div class="modal-actions">
                <button class="modal-btn btn-secondary" onclick="prevStep()">上一步</button>
                <button class="modal-btn btn-primary" onclick="nextStep()">我已完成这个动作</button>
            </div>
        `;
    } else if (currentStep === 3) {
        // 第三步：建立新连接
        stepContent = `
            <h3 class="modal-title">🛣️ 建立新神经通路</h3>
            <div class="modal-body">
                <div class="modal-step">
                    <div class="step-title">【思考这个问题】</div>
                    <p style="font-size: 1.1rem; padding: 0.5rem 0;">${currentPattern.replace}</p>
                    <p style="color: #666; font-size: 0.9rem;">✍️ 请在心中或纸上写下你的答案。</p>
                </div>
                <div class="modal-step">
                    <div class="step-title">📝 简要记录你的行动或思考</div>
                    <input type="text" id="userActionInput" placeholder="例如：我决定先写个草稿大纲" 
                           style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 8px; margin-top: 0.5rem;">
                </div>
                <div class="modal-step">
                    <div class="step-title">📊 现在心情如何？ (1-5分)</div>
                    <div class="mood-selector">
                        ${[1, 2, 3, 4, 5].map(num => `
                            <button class="mood-btn ${moodAfter === num ? 'selected' : ''}" 
                                    onclick="selectMoodAfter(${num})">
                                ${num === 1 ? '😫' : num === 2 ? '😔' : num === 3 ? '😐' : num === 4 ? '🙂' : '😊'}
                            </button>
                        `).join('')}
                    </div>
                    <div style="text-align: center; font-size: 0.9rem; color: #666; margin-top: 0.5rem;">
                        ${moodAfter === 1 ? '很糟' : moodAfter === 2 ? '不佳' : moodAfter === 3 ? '一般' : moodAfter === 4 ? '不错' : '很好'}
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button class="modal-btn btn-secondary" onclick="prevStep()">上一步</button>
                <button class="modal-btn btn-primary" onclick="completeRecord()">完成记录</button>
            </div>
        `;
    } else if (currentStep === 4) {
        // 第四步：完成
        const effectiveness = moodAfter - moodBefore;
        stepContent = `
            <h3 class="modal-title">✅ 重塑完成！</h3>
            <div class="modal-body">
                <div style="text-align: center; padding: 1rem 0;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
                    <p><strong>成功中断了：${currentPattern.name}</strong></p>
                    <p>情绪变化：${moodBefore} → ${moodAfter} (${effectiveness > 0 ? '+' : ''}${effectiveness})</p>
                    <p style="color: #666; font-size: 0.9rem; margin-top: 1rem;">每一次成功重塑，都在物理上弱化了旧的神经通路，强化了新的连接。</p>
                </div>
            </div>
            <div class="modal-actions">
                <button class="modal-btn btn-primary" onclick="closeModalAndRefresh()">太棒了，继续使用</button>
            </div>
        `;
    }
    
    content.innerHTML = stepContent;
    overlay.style.display = 'flex';
    
    // 如果是第三步，聚焦输入框
    if (currentStep === 3) {
        setTimeout(() => {
            const input = document.getElementById('userActionInput');
            if (input) input.focus();
        }, 100);
    }
}

// 工具函数：步骤控制与心情选择
function selectMoodBefore(num) { moodBefore = num; showStepModal(); }
function selectMoodAfter(num) { moodAfter = num; showStepModal(); }
function prevStep() { currentStep--; showStepModal(); }
function nextStep() { currentStep++; showStepModal(); }
function closeModal() { document.getElementById('modalOverlay').style.display = 'none'; }
function closeModalAndRefresh() { 
    closeModal(); 
    setTimeout(() => {
        renderStatsPanel();
        renderRecordList();
    }, 300);
}

// 完成记录
function completeRecord() {
    const userActionInput = document.getElementById('userActionInput');
    const userAction = userActionInput ? userActionInput.value.trim() : '已执行重塑';
    
    const newRecord = {
        id: Date.now(),
        date: new Date().toLocaleDateString('zh-CN'),
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        pattern: currentPattern.name,
        trigger: currentPattern.desc,
        action: userAction || currentPattern.replace,
        mood: { before: moodBefore, after: moodAfter },
        effectiveness: moodAfter - moodBefore
    };
    
    records.unshift(newRecord);
    saveRecords();
    currentStep = 4;
    showStepModal();

    if (currentPattern.name === '🚫 想象循环') {
    newRecord.specialTags = ['social_imagination'];
    newRecord.triggerType = prompt('这次想象是如何触发的？\n（例如：看到社交媒体、空闲时、睡前）');
    newRecord.intensity = prompt('从1-10分，这个想象的强迫感有多强？');
}
}

// 在 completeRecord() 函数后，添加这个专属强化函数
function reinforceSocialPattern(record) {
    // 专属的强化逻辑
    const affirmations = [
        "我的价值不依赖于任何人的选择。",
        "我尊重她的自主性，正如我尊重自己的。",
        "我的大脑在练习‘放手’这个技能。",
        "想象不是预言，而是我的安全感在说话。"
    ];
    
    const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
    
    // 可以记录到专属的加固日志
    const reinforcementLog = {
        pattern: '社交想象',
        timestamp: new Date().toISOString(),
        originalMood: record.mood,
        affirmation: randomAffirmation,
        insight: '每次中断，都在弱化“过度模拟”的神经通路。'
    };
    
    console.log('强化记录:', reinforcementLog); // 后续可存入独立存储
    return randomAffirmation;
}

// 然后在 completeRecord() 中调用（在保存记录后）：
// const affirmation = reinforceSocialPattern(newRecord);
// alert(`💎 强化认知：${affirmation}`);

// ==================== 5. 数据分析与统计 ====================
function getStats() {
    const today = new Date().toLocaleDateString('zh-CN');
    const todayRecords = records.filter(r => r.date === today);
    
    // 平均效果分
    const avgEffect = records.length > 0 
        ? (records.reduce((sum, r) => sum + r.effectiveness, 0) / records.length).toFixed(1)
        : 0;
    
    // 最常处理的模式
    const patternCount = {};
    records.forEach(r => {
        patternCount[r.pattern] = (patternCount[r.pattern] || 0) + 1;
    });
    const topPattern = Object.keys(patternCount).length > 0
        ? Object.entries(patternCount).sort((a, b) => b[1] - a[1])[0][0]
        : '无';
    
    // 最佳时段（记录最多的时段）
    const hourCount = {};
    records.forEach(r => {
        const hour = r.time.split(':')[0];
        hourCount[hour] = (hourCount[hour] || 0) + 1;
    });
    const bestTime = Object.keys(hourCount).length > 0
        ? Object.entries(hourCount).sort((a, b) => b[1] - a[1])[0][0] + ':00'
        : '暂无';
    
    return {
        total: records.length,
        today: todayRecords.length,
        avgEffect: avgEffect,
        topPattern: topPattern,
        bestTime: bestTime
    };
}

// ==================== 6. 数据导出与维护 ====================
// 导出为Markdown文件（用于Obsidian）
function exportToMarkdown() {
    if (records.length === 0) {
        alert('暂无记录可导出。');
        return;
    }
    
    const today = new Date().toLocaleDateString('zh-CN');
    const stats = getStats();
    
    let mdContent = `# 🧪 神经重塑实验记录\n\n`;
    mdContent += `> 导出时间：${new Date().toLocaleString('zh-CN')}  |  总记录：${stats.total}次  |  平均效果：${stats.avgEffect}\n\n`;
    
    mdContent += `## 📈 数据概览\n`;
    mdContent += `- **最常处理的模式**：${stats.topPattern}\n`;
    mdContent += `- **最佳重塑时段**：${stats.bestTime}\n\n`;
    
    mdContent += `## 📅 详细记录\n`;
    
    // 按日期分组记录
    const recordsByDate = {};
    records.forEach(record => {
        if (!recordsByDate[record.date]) recordsByDate[record.date] = [];
        recordsByDate[record.date].push(record);
    });
    
    // 按日期倒序排列
    Object.keys(recordsByDate).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
        mdContent += `### ${date}\n`;
        recordsByDate[date].forEach(record => {
            const moodTrend = record.effectiveness > 0 ? '↑' : record.effectiveness < 0 ? '↓' : '→';
            mdContent += `- **${record.time}** - ${record.pattern}\n`;
            mdContent += `  - 行动：${record.action}\n`;
            mdContent += `  - 情绪：${record.mood.before} → ${record.mood.after} ${moodTrend}${Math.abs(record.effectiveness)}\n`;
        });
        mdContent += `\n`;
    });
    
    // 分析总结
    mdContent += `## 🔍 模式分析与洞见\n`;
    const patternStats = {};
    records.forEach(r => {
        if (!patternStats[r.pattern]) patternStats[r.pattern] = { count: 0, totalEffect: 0 };
        patternStats[r.pattern].count++;
        patternStats[r.pattern].totalEffect += r.effectiveness;
    });
    
    Object.entries(patternStats).forEach(([pattern, data]) => {
        const avg = (data.totalEffect / data.count).toFixed(1);
        mdContent += `- **${pattern}**：${data.count}次，平均效果 ${avg}\n`;
    });
    
    // 创建并触发下载
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `神经重塑记录_${today}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert(`导出成功！文件已保存为“神经重塑记录_${today}.md”。你可以将其直接拖入Obsidian。`);
}

// 清理旧数据（保留30天）
function clearOldData() {
    if (records.length === 0) {
        alert('暂无数据可清理。');
        return;
    }
    
    const confirmClear = confirm(`当前共有 ${records.length} 条记录。\n此操作将删除30天前的所有记录，只保留最近30天的数据。\n\n确定继续吗？`);
    if (!confirmClear) return;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const oldLength = records.length;
    records = records.filter(record => {
        const recordDate = new Date(record.date.replace(/[年月]/g, '/').replace('日', ''));
        return recordDate >= thirtyDaysAgo;
    });
    
    const removedCount = oldLength - records.length;
    saveRecords();
    renderStatsPanel();
    renderRecordList();
    
    alert(`清理完成！删除了 ${removedCount} 条旧记录，保留了 ${records.length} 条最近30天的记录。`);
}

// ==================== 7. 应用启动 ====================
// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initApp);

// 监听返回键关闭弹窗
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});