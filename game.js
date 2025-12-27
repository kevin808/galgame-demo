// 雪山庄杀人事件 - 游戏引擎（预加载资源版本）

// 相机控制器 - 处理全景背景的拖拽和移动
class CameraController {
    constructor(backgroundElement) {
        this.background = backgroundElement;
        this.isDragging = false;
        this.startX = 0;
        this.currentX = 0;
        this.targetX = 0;
        this.velocity = 0;
        this.minX = 0;  // 最左边界
        this.maxX = 0;  // 最右边界
        this.enabled = false;

        this.bindEvents();
        this.startAnimation();
    }

    // 启用相机控制（当背景是宽幅图时调用）
    enable(backgroundWidth, viewportWidth) {
        this.enabled = true;
        this.maxX = Math.max(0, backgroundWidth - viewportWidth);
        this.minX = 0;
        // 初始位置居中
        this.currentX = this.maxX / 2;
        this.targetX = this.currentX;
        this.updateBackground();
    }

    // 禁用相机控制（普通背景）
    disable() {
        this.enabled = false;
        this.currentX = 0;
        this.targetX = 0;
        this.updateBackground();
    }

    bindEvents() {
        // 鼠标拖拽
        this.background.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e), { passive: false });
        document.addEventListener('mouseup', () => this.onMouseUp());

        // 触摸拖拽（移动端支持）
        this.background.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        document.addEventListener('touchend', () => this.onMouseUp());

        // 双击复位
        this.background.addEventListener('dblclick', () => this.resetPosition());

        // 键盘控制
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
    }

    onMouseDown(e) {
        if (!this.enabled) return;
        this.isDragging = true;
        this.startX = e.clientX - this.currentX;
        this.background.style.cursor = 'grabbing';
    }

    onMouseMove(e) {
        if (!this.enabled || !this.isDragging) return;
        e.preventDefault();
        this.targetX = e.clientX - this.startX;
        this.clampPosition();
    }

    onMouseUp() {
        if (!this.enabled) return;
        this.isDragging = false;
        this.background.style.cursor = 'grab';
    }

    onTouchStart(e) {
        if (!this.enabled) return;
        this.isDragging = true;
        this.startX = e.touches[0].clientX - this.currentX;
    }

    onTouchMove(e) {
        if (!this.enabled || !this.isDragging) return;
        e.preventDefault();
        this.targetX = e.touches[0].clientX - this.startX;
        this.clampPosition();
    }

    onKeyDown(e) {
        if (!this.enabled) return;

        const moveSpeed = 50; // 键盘移动速度

        switch(e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.targetX = Math.max(this.minX, this.targetX - moveSpeed);
                e.preventDefault();
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.targetX = Math.min(this.maxX, this.targetX + moveSpeed);
                e.preventDefault();
                break;
        }
    }

    // 限制位置在边界内
    clampPosition() {
        this.targetX = Math.max(this.minX, Math.min(this.maxX, this.targetX));
    }

    // 复位到中心位置
    resetPosition() {
        if (!this.enabled) return;
        this.targetX = this.maxX / 2;
    }

    // 平滑动画循环
    startAnimation() {
        const animate = () => {
            if (this.enabled) {
                // 平滑插值（easing）
                const diff = this.targetX - this.currentX;
                this.currentX += diff * 0.1; // 0.1 是平滑系数，值越小越平滑

                // 如果差距很小就直接设置，避免无限接近
                if (Math.abs(diff) < 0.1) {
                    this.currentX = this.targetX;
                }

                this.updateBackground();
            }
            requestAnimationFrame(animate);
        };
        animate();
    }

    // 更新背景位置
    updateBackground() {
        this.background.style.backgroundPosition = `-${this.currentX}px center`;
    }
}

class GameEngine {
    constructor() {
        this.currentScene = 0;
        this.currentLine = 0;
        this.script = [];
        this.clues = [];
        this.flags = {};
        this.isAutoMode = false;
        this.isTyping = false;
        this.autoTimer = null;
        this.currentAudio = null;
        this.currentBGM = null;
        this.assetMap = null;
        this.camera = null; // 相机控制器

        this.initElements();
        this.bindEvents();
        this.initCamera(); // 初始化相机控制器
    }

    initElements() {
        this.screens = {
            title: document.getElementById('title-screen'),
            game: document.getElementById('game-screen'),
            ending: document.getElementById('ending-screen')
        };
        
        this.elements = {
            background: document.getElementById('background'),
            speakerName: document.getElementById('speaker-name'),
            dialogText: document.getElementById('dialog-text'),
            dialogBox: document.getElementById('dialog-box'),
            choicesArea: document.getElementById('choices-area'),
            cluePanel: document.getElementById('clue-panel'),
            clueList: document.getElementById('clue-list'),
            voiceIndicator: document.getElementById('voice-indicator'),
            loadingOverlay: document.getElementById('loading-overlay'),
            endingTitle: document.getElementById('ending-title'),
            endingText: document.getElementById('ending-text'),
            characters: {
                left: document.getElementById('character-left'),
                center: document.getElementById('character-center'),
                right: document.getElementById('character-right')
            }
        };
        
        this.buttons = {
            start: document.getElementById('start-btn'),
            continue: document.getElementById('continue-btn'),
            back: document.getElementById('back-btn'),
            clue: document.getElementById('clue-btn'),
            auto: document.getElementById('auto-btn'),
            skip: document.getElementById('skip-btn'),
            closeClue: document.getElementById('close-clue-btn'),
            restart: document.getElementById('restart-btn')
        };
        
        // 检查是否有存档
        this.checkSaveData();
    }

    bindEvents() {
        this.buttons.start.addEventListener('click', () => this.startGame(false));
        this.buttons.continue.addEventListener('click', () => this.startGame(true));
        this.buttons.back.addEventListener('click', () => this.restartGame());
        this.buttons.restart.addEventListener('click', () => this.restartGame());
        this.elements.dialogBox.addEventListener('click', () => this.advance());
        this.buttons.clue.addEventListener('click', () => this.toggleCluePanel());
        this.buttons.closeClue.addEventListener('click', () => this.toggleCluePanel());
        this.buttons.auto.addEventListener('click', () => this.toggleAutoMode());
        this.buttons.skip.addEventListener('click', () => this.skipTyping());
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                this.advance();
            }
        });
    }

    initCamera() {
        // 初始化相机控制器，传入背景元素
        this.camera = new CameraController(this.elements.background);
        console.log('相机控制器已初始化');
    }

    async startGame(loadSave = false) {
        this.showLoading();

        // 加载资源映射
        await this.loadAssetMap();

        this.hideLoading();
        this.switchScreen('game');

        // 开始游戏时播放调查场景BGM
        this.playBGM('investigation');

        if (loadSave) {
            this.loadGame();
        } else {
            this.runScript(gameScript);
        }
    }
    
    // 检查存档
    checkSaveData() {
        const saveData = localStorage.getItem('snowMansion_save');
        if (saveData) {
            this.buttons.continue.classList.remove('hidden');
        }
    }
    
    // 保存游戏
    saveGame() {
        const saveData = {
            currentLine: this.currentLine,
            clues: this.clues,
            flags: this.flags
        };
        localStorage.setItem('snowMansion_save', JSON.stringify(saveData));
    }
    
    // 加载游戏
    loadGame() {
        const saveData = localStorage.getItem('snowMansion_save');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.script = gameScript;
            this.currentLine = data.currentLine;
            this.clues = data.clues || [];
            this.flags = data.flags || {};
            
            // 恢复线索列表UI
            this.clues.forEach(clue => {
                const li = document.createElement('li');
                li.textContent = clue;
                this.elements.clueList.appendChild(li);
            });
            
            // 恢复背景
            this.restoreBackground();
            
            this.processLine();
        } else {
            this.runScript(gameScript);
        }
    }
    
    // 恢复背景图
    restoreBackground() {
        // 从当前位置往前找最近的背景设置
        for (let i = this.currentLine; i >= 0; i--) {
            if (this.script[i].type === 'background') {
                this.setBackground(this.script[i].image);
                break;
            }
        }
    }
    
    // 清除存档
    clearSave() {
        localStorage.removeItem('snowMansion_save');
        this.buttons.continue.classList.add('hidden');
    }

    async loadAssetMap() {
        try {
            const response = await fetch('assets/asset_map.json');
            this.assetMap = await response.json();
            console.log('资源映射加载成功:', this.assetMap);
        } catch (e) {
            console.warn('资源映射加载失败，将使用备用方案:', e);
            this.assetMap = { voices: {}, images: {}, bgm: {} };
        }
    }

    // BGM播放管理
    playBGM(bgmKey, loop = true) {
        const bgmPath = this.assetMap?.bgm?.[bgmKey];
        if (!bgmPath) {
            console.warn('BGM文件未找到:', bgmKey);
            return;
        }

        // 如果当前BGM相同，不重复播放
        if (this.currentBGM && this.currentBGM.src.includes(bgmPath)) {
            return;
        }

        // 停止当前BGM
        this.stopBGM();

        // 播放新BGM
        this.currentBGM = new Audio(bgmPath);
        this.currentBGM.loop = loop;
        this.currentBGM.volume = 0.3; // 默认音量30%
        this.currentBGM.play().catch(e => console.warn('BGM播放失败:', e));
        console.log('正在播放BGM:', bgmKey);
    }

    stopBGM() {
        if (this.currentBGM) {
            this.currentBGM.pause();
            this.currentBGM.currentTime = 0;
            this.currentBGM = null;
        }
    }

    fadeBGM(targetVolume, duration = 1000) {
        if (!this.currentBGM) return;

        const startVolume = this.currentBGM.volume;
        const volumeChange = targetVolume - startVolume;
        const steps = 20;
        const stepDuration = duration / steps;
        const stepVolume = volumeChange / steps;

        let currentStep = 0;
        const fadeInterval = setInterval(() => {
            currentStep++;
            if (currentStep >= steps) {
                clearInterval(fadeInterval);
                this.currentBGM.volume = targetVolume;
            } else {
                this.currentBGM.volume = startVolume + (stepVolume * currentStep);
            }
        }, stepDuration);
    }

    restartGame() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
        this.stopBGM();
        this.currentScene = 0;
        this.currentLine = 0;
        this.clues = [];
        this.flags = {};
        this.isAutoMode = false;
        this.isTyping = false;
        this.elements.clueList.innerHTML = '';
        this.elements.voiceIndicator.classList.add('hidden');
        this.elements.choicesArea.classList.add('hidden');
        this.elements.cluePanel.classList.add('hidden');
        this.buttons.auto.classList.remove('active');
        this.switchScreen('title');
        // 返回标题时播放主题曲
        this.playBGM('theme');
    }

    switchScreen(screenName) {
        Object.values(this.screens).forEach(s => s.classList.remove('active'));
        this.screens[screenName].classList.add('active');
    }

    showLoading() {
        this.elements.loadingOverlay.classList.remove('hidden');
    }

    hideLoading() {
        this.elements.loadingOverlay.classList.add('hidden');
    }

    playVoice(voiceId) {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
        
        const voicePath = this.assetMap?.voices?.[voiceId];
        if (!voicePath) {
            console.warn('语音文件未找到:', voiceId);
            if (this.isAutoMode) {
                setTimeout(() => this.advance(), 2000);
            }
            return;
        }

        this.elements.voiceIndicator.classList.remove('hidden');
        this.currentAudio = new Audio(voicePath);
        this.currentAudio.play().catch(e => console.warn('语音播放失败:', e));
        this.currentAudio.onended = () => {
            this.elements.voiceIndicator.classList.add('hidden');
            if (this.isAutoMode) {
                setTimeout(() => this.advance(), 500);
            }
        };
    }

    setBackground(imageId) {
        const imagePath = this.assetMap?.images?.[imageId];

        if (imagePath) {
            // 设置背景图片
            this.elements.background.style.backgroundImage = `url(${imagePath})`;

            // 加载图片以检测是否为宽幅图
            const img = new Image();
            img.onload = () => {
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                // 计算按高度100%缩放后的实际宽度
                const aspectRatio = img.naturalWidth / img.naturalHeight;
                let scaledWidth = viewportHeight * aspectRatio;

                // 如果图片宽度不够（小于视口2倍），放大到至少2倍以提供移动空间
                const minWidth = viewportWidth * 2; // 最小宽度为视口的2倍
                if (scaledWidth < minWidth) {
                    // 按宽度缩放
                    scaledWidth = minWidth;
                    const scaledHeight = minWidth / aspectRatio;
                    this.elements.background.style.backgroundSize = `${minWidth}px auto`;
                    console.log(`背景放大: 设置为${Math.round(minWidth)}px宽，启用视角移动`);
                } else {
                    // 保持高度100%
                    this.elements.background.style.backgroundSize = `auto 100%`;
                    console.log(`宽幅背景: 原始${img.naturalWidth}px，缩放后${Math.round(scaledWidth)}px，启用视角移动`);
                }

                // 启用相机控制
                this.camera.enable(scaledWidth, viewportWidth);
            };
            img.onerror = () => {
                console.warn('背景图片加载失败，禁用相机控制');
                this.camera.disable();
            };
            img.src = imagePath;
        } else {
            // 使用渐变色作为后备
            const gradients = {
                'scene1': 'linear-gradient(135deg, #1a1a2e 0%, #2d3436 50%, #000 100%)',
                'scene2': 'linear-gradient(135deg, #2c1810 0%, #4a2c2a 50%, #1a0a0a 100%)',
                'scene3': 'linear-gradient(135deg, #1a0a0a 0%, #3d1a1a 50%, #2a1515 100%)'
            };
            this.elements.background.style.background = gradients[imageId] || '#1a1a2e';
            this.camera.disable();
        }
    }

    runScript(script) {
        this.script = script;
        this.currentLine = 0;
        this.processLine();
    }

    processLine() {
        if (this.currentLine >= this.script.length) {
            return;
        }
        
        const line = this.script[this.currentLine];
        
        // 检查条件
        if (line.condition && !this.checkCondition(line.condition)) {
            this.currentLine++;
            setTimeout(() => this.processLine(), 0);
            return;
        }
        
        switch (line.type) {
            case 'dialog':
                this.showDialog(line);
                break;
            case 'background':
                this.setBackground(line.image);
                this.currentLine++;
                setTimeout(() => this.processLine(), 0);
                break;
            case 'bgm':
                this.playBGM(line.bgm, line.loop !== false);
                this.currentLine++;
                setTimeout(() => this.processLine(), 0);
                break;
            case 'choice':
                this.showChoices(line.choices);
                break;
            case 'clue':
                this.addClue(line.clue);
                this.currentLine++;
                setTimeout(() => this.processLine(), 0);
                break;
            case 'flag':
                this.flags[line.flag] = line.value;
                this.currentLine++;
                setTimeout(() => this.processLine(), 0);
                break;
            case 'jump':
                this.jumpToLabel(line.label);
                break;
            case 'ending':
                this.showEnding(line.title, line.text);
                break;
        }
    }

    async showDialog(line) {
        this.elements.speakerName.textContent = line.speaker || '';
        this.elements.dialogText.textContent = '';
        
        // 打字机效果
        await this.typeText(line.text);
        
        // 播放预生成的语音
        if (line.voice) {
            this.playVoice(line.voice);
        }
    }

    async typeText(text) {
        this.isTyping = true;
        const chars = text.split('');
        
        for (let i = 0; i < chars.length; i++) {
            if (!this.isTyping) {
                this.elements.dialogText.textContent = text;
                break;
            }
            this.elements.dialogText.textContent += chars[i];
            await this.delay(50);
        }
        
        this.isTyping = false;
    }

    skipTyping() {
        this.isTyping = false;
    }

    showChoices(choices) {
        this.elements.choicesArea.innerHTML = '';
        this.elements.choicesArea.classList.remove('hidden');
        
        choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = choice.text;
            btn.addEventListener('click', () => this.selectChoice(choice));
            this.elements.choicesArea.appendChild(btn);
        });
    }

    selectChoice(choice) {
        this.elements.choicesArea.classList.add('hidden');
        
        if (choice.flag) {
            this.flags[choice.flag] = choice.value !== undefined ? choice.value : true;
        }
        
        if (choice.jump) {
            this.jumpToLabel(choice.jump);
        } else {
            this.currentLine++;
            this.processLine();
        }
        
        this.saveGame();
    }

    addClue(clue) {
        if (!this.clues.includes(clue)) {
            this.clues.push(clue);
            
            const li = document.createElement('li');
            li.textContent = clue;
            li.className = 'new';
            this.elements.clueList.appendChild(li);
            
            this.showClueNotification(clue);
            
            setTimeout(() => li.classList.remove('new'), 3000);
        }
    }

    showClueNotification(clue) {
        const notification = document.createElement('div');
        notification.className = 'clue-notification';
        notification.textContent = `🔍 发现线索: ${clue}`;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 2500);
    }

    toggleCluePanel() {
        this.elements.cluePanel.classList.toggle('hidden');
    }

    toggleAutoMode() {
        this.isAutoMode = !this.isAutoMode;
        this.buttons.auto.classList.toggle('active', this.isAutoMode);
        
        if (this.isAutoMode && !this.isTyping) {
            this.advance();
        }
    }

    checkCondition(condition) {
        if (typeof condition === 'function') {
            return condition(this.flags, this.clues);
        }
        return this.flags[condition];
    }

    jumpToLabel(label) {
        const index = this.script.findIndex(line => line.label === label);
        if (index !== -1) {
            this.currentLine = index;
            setTimeout(() => this.processLine(), 0);
        }
    }

    advance() {
        if (this.isTyping) {
            this.skipTyping();
            return;
        }
        
        const currentType = this.script[this.currentLine]?.type;
        if (currentType === 'choice') {
            return;
        }
        
        this.currentLine++;
        this.saveGame();
        this.processLine();
    }

    showEnding(title, text) {
        this.elements.endingTitle.textContent = title;
        this.elements.endingText.textContent = text;
        this.clearSave();
        this.switchScreen('ending');

        // 根据结局类型播放对应BGM
        if (title.includes('TRUE END')) {
            this.playBGM('true_end', false); // 不循环
        } else if (title.includes('BAD END')) {
            this.playBGM('bad_end', false); // 不循环
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 初始化游戏引擎
let game;
document.addEventListener('DOMContentLoaded', async () => {
    game = new GameEngine();
    // 加载资源映射后播放主题曲
    await game.loadAssetMap();
    game.playBGM('theme');
});
