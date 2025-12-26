// 你的心理学产品数据库
const OLD_PATTERNS = [
    {
        id: '1',
        name: '🧠 思维反刍',
        desc: '反复想同一件事',
        why: '默认模式网络过度活跃',
        stop: '站起来 → 5次深蹲 → 喝水',
        replace: '问：此刻我能做的最小行动是什么？'
    }
    // ... 可以继续添加其他模式
];

let records = JSON.parse(localStorage.getItem('neuroRecords')) || [];

// 页面加载后，生成旧模式列表
document.addEventListener('DOMContentLoaded', function() {
    const listContainer = document.getElementById('patternList');
    
    OLD_PATTERNS.forEach(pattern => {
        const patternCard = document.createElement('div');
        patternCard.className = 'pattern-card';
        patternCard.innerHTML = `
            <div class="card-header">
                <h3>${pattern.name}</h3>
                <span class="red-dot"></span>
            </div>
            <p>${pattern.desc}</p>
            <small>点击开始重塑</small>
        `;
        patternCard.onclick = () => handlePatternClick(pattern);
        listContainer.appendChild(patternCard);
    });
});

// 处理点击 - 这就是你的四步流程！
function handlePatternClick(pattern) {
    if (confirm(`识别到：${pattern.name}\n\n💡 原理：${pattern.why}\n\n是否开始处理？`)) {
        if (confirm(`⚡ 中断方法：\n${pattern.stop}\n\n请执行后点击“确定”。`)) {
            const userAnswer = prompt(`🛣️ 建立新连接：\n${pattern.replace}\n\n请输入你的思考或行动：`);
            if (userAnswer) {
                saveRecord(pattern, userAnswer);
                alert(`✅ 重塑完成！\n已记录本次改变。`);
            }
        }
    }
}

// 保存记录到本地
function saveRecord(pattern, action) {
    const newRecord = {
        id: Date.now(),
        pattern: pattern.name,
        action: action,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };
    records.unshift(newRecord); // 新记录放前面
    localStorage.setItem('neuroRecords', JSON.stringify(records));
}

// 显示记录
function showRecords() {
    const list = document.getElementById('recordList');
    list.innerHTML = '';
    records.slice(0, 5).forEach(record => {
        const li = document.createElement('li');
        li.textContent = `✅ ${record.pattern} - ${record.time}`;
        list.appendChild(li);
    });
    document.getElementById('recordPanel').style.display = 'block';
}
function hideRecords() { document.getElementById('recordPanel').style.display = 'none'; }