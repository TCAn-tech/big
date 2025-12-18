const questionBank = {
    easy: [
        {q: "HTML是什么？", opts: ["编程语言", "标记语言", "数据库", "操作系统"], a: 1},
        {q: "CSS用于什么？", opts: ["网页样式", "数据存储", "网络请求", "逻辑运算"], a: 0},
        {q: "JavaScript是什么？", opts: ["脚本语言", "数据库", "操作系统", "图像软件"], a: 0}
    ],
    medium: [
        {q: "document.getElementById做什么？", opts: ["获取元素", "创建元素", "删除元素", "修改元素"], a: 0}
    ],
    hard: [
        {q: "什么是闭包？", opts: ["函数访问外部变量", "函数定义", "变量声明", "循环语句"], a: 0}
    ]
};

// 2. 游戏状态
let user = null;                // 当前用户
let difficulty = 'easy';        // 难度
let questions = [];             // 当前题目
let currentIndex = 0;           // 当前题目索引
let score = 0;                  // 分数
let life = 3;                   // 生命
let timeLeft = 15;              // 时间
let timer = null;               // 计时器

// 3. 工具函数
function showPage(pageId) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    // 显示指定页面
    document.getElementById(pageId).classList.remove('hidden');
}

// 4. 用户系统
function login() {
    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;
    
    // 简单验证
    if (!name || !password) {
        document.getElementById('error').textContent = '请输入用户名和密码';
        return;
    }
    
    // 获取用户列表
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // 查找用户
    const found = users.find(u => u.name === name && u.password === password);
    
    if (found) {
        // 登录成功
        user = found;
        document.getElementById('user-name').textContent = name;
        showPage('menu-page');
    } else {
        document.getElementById('error').textContent = '用户名或密码错误';
    }
}

function register() {
    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;
    
    if (!name || !password) {
        document.getElementById('error').textContent = '请输入用户名和密码';
        return;
    }
    
    // 获取用户列表
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // 检查是否已存在
    if (users.some(u => u.name === name)) {
        document.getElementById('error').textContent = '用户名已存在';
        return;
    }
    
    // 创建新用户
    const newUser = {name, password, score: 0};
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // 自动登录
    user = newUser;
    document.getElementById('user-name').textContent = name;
    showPage('menu-page');
    
    alert('注册成功！');
}
//游客功能
function guestLogin() {
    user = {name: '游客' + Math.floor(Math.random() * 1000), score: 0};
    document.getElementById('user-name').textContent = user.name;
    showPage('menu-page');
}
//退出功能
function logout() {
    user = null;
    document.getElementById('name').value = '';
    document.getElementById('password').value = '';
    document.getElementById('error').textContent = '';
    showPage('login-page');
}

// 5. 游戏系统
function setDifficulty(level) {
    difficulty = level;
}

function startGame() {
    if (!user) {
        alert('请先登录');
        return;
    }
    
    // 重置游戏
    questions = [...questionBank[difficulty]];
    currentIndex = 0;
    score = 0;
    life = 3;
    timeLeft = 15;
    
    // 更新显示
    document.getElementById('score').textContent = score;
    document.getElementById('life').textContent = life;
    
    // 显示游戏页面
    showPage('game-page');
    
    // 加载题目
    loadQuestion();
}

function loadQuestion() {
    clearInterval(timer);
    
    // 检查是否还有题目
    if (currentIndex >= questions.length) {
        endGame();
        return;
    }
    
    const question = questions[currentIndex];
    
    // 显示题目
    document.getElementById('question-text').textContent = question.q;
    
    // 清空选项
    const optionsDiv = document.getElementById('answer-options');
    optionsDiv.innerHTML = '';
    
    // 添加选项
    question.opts.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.textContent = option;
        
        // 点击选项
        optionDiv.onclick = () => checkAnswer(index, question.a);
        
        optionsDiv.appendChild(optionDiv);
    });
    
    // 开始计时
    startTimer();
}

function startTimer() {
    timeLeft = 15;
    document.getElementById('time').textContent = timeLeft;
    
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('time').textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            wrongAnswer();
        }
    }, 1000);
}

function checkAnswer(selected, correct) {
    clearInterval(timer);
    
    if (selected === correct) {
        // 答对了
        score += 10;
        document.getElementById('score').textContent = score;
        
        // 进入下一题
        currentIndex++;
        setTimeout(loadQuestion, 1000);
    } else {
        // 答错了
        wrongAnswer();
    }
}

function wrongAnswer() {
    life--;
    document.getElementById('life').textContent = life;
    
    if (life <= 0) {
        endGame();
    } else {
        currentIndex++;
        setTimeout(loadQuestion, 1000);
    }
}

function endGame() {
    // 更新用户分数
    user.score = (user.score || 0) + score;
    
    // 保存用户数据
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const index = users.findIndex(u => u.name === user.name);
    if (index !== -1) {
        users[index] = user;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    alert(`游戏结束！得分：${score}`);
    backToMenu();
}

function backToMenu() {
    clearInterval(timer);
    showPage('menu-page');
}

// 6. 题库系统
function showQuestions() {
    const listDiv = document.getElementById('question-list');
    listDiv.innerHTML = '';
    
    // 显示所有题目
    Object.keys(questionBank).forEach(level => {
        // 难度标题
        const title = document.createElement('h4');
        title.textContent = level === 'easy' ? '简单题' : 
                           level === 'medium' ? '中等题' : '难题';
        listDiv.appendChild(title);
        
        // 题目列表
        questionBank[level].forEach((q, i) => {
            const item = document.createElement('div');
            item.innerHTML = `
                <p><strong>${i+1}. ${q.q}</strong></p>
                <p>答案：${q.opts[q.a]}</p>
            `;
            listDiv.appendChild(item);
        });
    });
    
    // 显示弹窗
    document.getElementById('question-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('question-modal').classList.add('hidden');
}