#!/usr/bin/env node
// 资源预生成脚本 - 使用 Node.js 运行
// 用法: node generate_assets.js

const fs = require('fs');
const path = require('path');
const https = require('https');

// API 配置
const SPEECH_CONFIG = {
    hostname: 'xxx',
    key: 'xxx'
};

const IMAGE_CONFIG = {
    hostname: 'xxx',
    token: 'xxx',
    workflowId: 'xxx'
};

// 角色语音映射
const VOICE_MAP = {
    '侦探': 'zh-CN-YunxiNeural',
    '管家': 'zh-CN-YunyangNeural',
    '夫人': 'zh-CN-XiaoxiaoNeural',
    '少爷': 'zh-CN-YunjianNeural',
    '女仆': 'zh-CN-XiaohanNeural',
    '旁白': 'zh-CN-YunyeNeural'
};

// 需要生成的场景图片
const SCENES = [
    { id: 'scene1', prompt: '雪夜山庄外景，暴风雪，神秘别墅，动漫风格' },
    { id: 'scene2', prompt: '豪华客厅，壁炉，案发现场，悬疑氛围，动漫风格' },
    { id: 'scene3', prompt: '书房内部，书架，暗红色调，神秘气氛，动漫风格' }
];

// 需要生成语音的对话
const DIALOGS = [
    { id: 'narr_01', speaker: '旁白', text: '大雪纷飞的夜晚，我接到一通神秘电话，赶往偏远的雪山庄。' },
    { id: 'narr_02', speaker: '旁白', text: '当我抵达时，这座百年别墅的主人——白鹤先生，已经死在了他的书房里。' },
    { id: 'butler_01', speaker: '管家', text: '侦探先生，感谢您冒着暴风雪前来。我是这里的管家，老张。' },
    { id: 'det_01', speaker: '侦探', text: '先简单说明一下情况吧。' },
    { id: 'butler_02', speaker: '管家', text: '今晚八点，我发现老爷倒在书房。门是从里面反锁的，我们破门而入时，他已经没有呼吸了。' },
    { id: 'det_02', speaker: '侦探', text: '目前庄内有哪些人？' },
    { id: 'butler_03', speaker: '管家', text: '除了我，还有夫人、少爷，以及一位新来的女仆小雪。暴风雪已经封锁了所有道路，没人能够离开。' },
    { id: 'det_03', speaker: '侦探', text: '这是一个密室，凶手一定还在这栋别墅里。' },
    { id: 'narr_03', speaker: '旁白', text: '我来到书房，白鹤先生的尸体已被移走，但现场保留完好。' },
    { id: 'det_04', speaker: '侦探', text: '书桌上有一杯喝了一半的红茶，杯底有白色残留物。' },
    { id: 'det_05', speaker: '侦探', text: '还有一封信，是一份遗嘱草稿！' },
    { id: 'det_06', speaker: '侦探', text: '将全部财产留给我新认的女儿，名字被墨水污损了。' },
    { id: 'det_07', speaker: '侦探', text: '窗户虚掩着，外面是鹅毛大雪。窗台上有少量融化的雪水。' },
    { id: 'det_08', speaker: '侦探', text: '有人从这里进出过？不，以这种暴风雪，从外面攀爬几乎不可能。' },
    { id: 'det_09', speaker: '侦探', text: '这扇窗是凶手故意打开的，想制造外人入侵的假象。' },
    { id: 'det_10', speaker: '侦探', text: '地毯上有几处不太明显的泥土痕迹，颜色很新鲜。' },
    { id: 'det_11', speaker: '侦探', text: '这些泥土似乎是从门口延伸进来的。有人近期穿着沾泥的鞋子进入过这里。' },
    { id: 'narr_04', speaker: '旁白', text: '我回到客厅，四位嫌疑人都在等候。是时候进行问询了。' },
    { id: 'wife_01', speaker: '夫人', text: '侦探先生，我和丈夫确实感情不和，但我绝不会杀他。' },
    { id: 'det_12', speaker: '侦探', text: '晚上八点您在哪里？' },
    { id: 'wife_02', speaker: '夫人', text: '我一直在卧室休息。管家可以作证，他七点半给我送过药。' },
    { id: 'wife_03', speaker: '夫人', text: '倒是那个新来的女仆，她总是鬼鬼祟祟的。而且我丈夫最近总是对她特别关照。' },
    { id: 'son_01', speaker: '少爷', text: '哼，我知道你们怀疑我。我确实需要钱，但我不会杀自己的父亲。' },
    { id: 'det_13', speaker: '侦探', text: '您晚上在做什么？' },
    { id: 'son_02', speaker: '少爷', text: '我在自己房间打游戏！你可以查我的游戏记录。' },
    { id: 'son_03', speaker: '少爷', text: '对了，我前天偷听到父亲和那个女仆吵架。女仆说，你欠我的，总要还的。' },
    { id: 'maid_01', speaker: '女仆', text: '侦探先生好。我只是一个普通的女仆。' },
    { id: 'det_14', speaker: '侦探', text: '你来这里多久了？' },
    { id: 'maid_02', speaker: '女仆', text: '才三个月。是老爷亲自面试录用我的。' },
    { id: 'det_15', speaker: '侦探', text: '晚上八点你在哪里？' },
    { id: 'maid_03', speaker: '女仆', text: '我在厨房准备明天的食材。' },
    { id: 'det_16', speaker: '侦探', text: '我注意到她的手指有些颤抖，她在害怕什么？' },
    { id: 'det_17', speaker: '侦探', text: '你的手套呢？我看到其他仆人都戴着白手套。' },
    { id: 'maid_04', speaker: '女仆', text: '啊，弄脏了，我换了一副。脏的那副应该还在厨房。' },
    { id: 'det_18', speaker: '侦探', text: '让我整理一下目前掌握的线索。' },
    { id: 'det_19', speaker: '侦探', text: '红茶中的毒药，遗嘱上的新认的女儿，你欠我的总要还，沾脏的手套。' },
    { id: 'det_20', speaker: '侦探', text: '真相只有一个！' },
    { id: 'det_21', speaker: '侦探', text: '各位，我已经知道凶手是谁了。' },
    { id: 'butler_04', speaker: '管家', text: '侦探先生，您在开玩笑吧？我服侍老爷三十年，怎么可能害他？' },
    { id: 'det_22', speaker: '侦探', text: '你有机会在红茶里下毒！' },
    { id: 'butler_05', speaker: '管家', text: '但我七点半在给夫人送药，有夫人作证。而且老爷的茶都是他自己泡的，从不让人插手。' },
    { id: 'narr_05', speaker: '旁白', text: '我的推理出现了漏洞，真凶趁机逃脱了。' },
    { id: 'wife_04', speaker: '夫人', text: '你说什么？！我有不在场证明！' },
    { id: 'butler_06', speaker: '管家', text: '确实，我七点半给夫人送药时，她一直在卧室，直到我发现老爷出事才叫她出来。' },
    { id: 'son_04', speaker: '少爷', text: '开什么玩笑！我的游戏记录可以证明我七点到九点一直在线上！' },
    { id: 'det_23', speaker: '侦探', text: '你可以让别人替你玩。' },
    { id: 'son_05', speaker: '少爷', text: '哈？那局排位我连赢五把，除了我谁能打出这种操作？' },
    { id: 'det_24', speaker: '侦探', text: '凶手就是你，小雪，或者我应该叫你，白雪？' },
    { id: 'det_25', speaker: '侦探', text: '白鹤先生二十多年前抛弃了一个女人和她腹中的孩子。那个孩子就是你。' },
    { id: 'det_26', speaker: '侦探', text: '遗嘱上写着新认的女儿，白鹤先生认出了你，想要弥补，所以打算把财产留给你。' },
    { id: 'maid_05', speaker: '女仆', text: '弥补？哈，我母亲因为他郁郁而终！他以为一份遗嘱就能抹去一切？' },
    { id: 'det_27', speaker: '侦探', text: '你趁着给他送茶的机会在红茶里下毒。你的手套上沾了花园的泥土，因为你从花园采了毒草。' },
    { id: 'det_28', speaker: '侦探', text: '然后你打开窗户，想制造外人入侵的假象。但窗台上的雪水说明，窗户是在案发后才被打开的。' },
    { id: 'maid_06', speaker: '女仆', text: '你说得对。我恨他，恨了二十年。但当他倒下的那一刻，我却感到一阵空虚。' },
    { id: 'maid_07', speaker: '女仆', text: '我杀了他，却也永远失去了真正了解他的机会。这就是复仇的代价吧。' },
    { id: 'narr_06', speaker: '旁白', text: '警察在暴风雪停止后抵达，带走了小雪。' },
    { id: 'narr_07', speaker: '旁白', text: '雪山庄杀人事件，就此落幕。' }
];

// 创建目录
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// 生成语音
function generateSpeech(dialog) {
    return new Promise((resolve) => {
        const voice = VOICE_MAP[dialog.speaker] || 'zh-CN-YunxiNeural';
        const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN"><voice name="${voice}">${dialog.text}</voice></speak>`;

        const options = {
            hostname: SPEECH_CONFIG.hostname,
            port: 443,
            path: '/tts/cognitiveservices/v1',
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': SPEECH_CONFIG.key,
                'Content-Type': 'application/ssml+xml',
                'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
                'Content-Length': Buffer.byteLength(ssml, 'utf8')
            }
        };

        const req = https.request(options, (res) => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const buffer = Buffer.concat(chunks);
                    const filePath = path.join('assets', 'voice', `${dialog.id}.mp3`);
                    fs.writeFileSync(filePath, buffer);
                    console.log(`✓ 语音生成: ${dialog.id} (${dialog.speaker})`);
                    resolve(filePath);
                } else {
                    console.error(`✗ 语音失败: ${dialog.id} - HTTP ${res.statusCode}`);
                    resolve(null);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`✗ 语音错误: ${dialog.id} - ${e.message}`);
            resolve(null);
        });

        req.write(ssml);
        req.end();
    });
}

// 生成图片
function generateImage(scene) {
    return new Promise((resolve) => {
        const postData = JSON.stringify({
            workflow_id: IMAGE_CONFIG.workflowId,
            parameters: { prompt: scene.prompt }
        });

        const options = {
            hostname: IMAGE_CONFIG.hostname,
            port: 443,
            path: '/v1/workflow/run',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${IMAGE_CONFIG.token}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.code === 0 && result.data) {
                        const innerData = JSON.parse(result.data);
                        const imageUrl = innerData.image_url;
                        console.log(`✓ 图片生成: ${scene.id} -> ${imageUrl}`);
                        downloadImage(imageUrl, scene.id).then(resolve);
                    } else {
                        console.error(`✗ 图片失败: ${scene.id} - ${result.msg || 'API error'}`);
                        resolve(null);
                    }
                } catch (e) {
                    console.error(`✗ 图片解析错误: ${scene.id} - ${e.message}`);
                    resolve(null);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`✗ 图片请求错误: ${scene.id} - ${e.message}`);
            resolve(null);
        });

        req.write(postData);
        req.end();
    });
}

// 下载图片
function downloadImage(url, id) {
    return new Promise((resolve) => {
        const filePath = path.join('assets', 'images', `${id}.jpg`);
        
        const download = (targetUrl) => {
            const urlObj = new URL(targetUrl);
            const options = {
                hostname: urlObj.hostname,
                port: 443,
                path: urlObj.pathname + urlObj.search,
                method: 'GET'
            };
            
            https.get(targetUrl, (res) => {
                if (res.statusCode === 301 || res.statusCode === 302) {
                    download(res.headers.location);
                    return;
                }
                
                const chunks = [];
                res.on('data', chunk => chunks.push(chunk));
                res.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    fs.writeFileSync(filePath, buffer);
                    console.log(`  ↳ 下载完成: ${filePath}`);
                    resolve(filePath);
                });
            }).on('error', () => {
                console.log(`  ↳ 下载失败，使用URL: ${url}`);
                resolve(url);
            });
        };
        
        download(url);
    });
}

// 生成资源映射
function generateAssetMap(voiceResults, imageResults) {
    const assetMap = { voices: {}, images: {} };

    DIALOGS.forEach((dialog, i) => {
        if (voiceResults[i]) {
            assetMap.voices[dialog.id] = `assets/voice/${dialog.id}.mp3`;
        }
    });

    SCENES.forEach((scene, i) => {
        if (imageResults[i]) {
            assetMap.images[scene.id] = imageResults[i].startsWith('http') 
                ? imageResults[i] 
                : `assets/images/${scene.id}.jpg`;
        }
    });

    fs.writeFileSync('assets/asset_map.json', JSON.stringify(assetMap, null, 2));
    console.log('\n✓ 资源映射: assets/asset_map.json');
}

// 主函数
async function main() {
    console.log('=== 雪山庄杀人事件 - 资源预生成 ===\n');
    
    ensureDir('assets/voice');
    ensureDir('assets/images');
    
    // 生成图片
    console.log('【生成场景图片】');
    const imageResults = [];
    for (const scene of SCENES) {
        const result = await generateImage(scene);
        imageResults.push(result);
        await new Promise(r => setTimeout(r, 2000));
    }
    
    // 生成语音
    console.log('\n【生成角色语音】');
    const voiceResults = [];
    for (const dialog of DIALOGS) {
        const result = await generateSpeech(dialog);
        voiceResults.push(result);
        await new Promise(r => setTimeout(r, 200));
    }
    
    generateAssetMap(voiceResults, imageResults);
    
    console.log('\n=== 完成 ===');
    console.log(`语音: ${voiceResults.filter(Boolean).length}/${DIALOGS.length}`);
    console.log(`图片: ${imageResults.filter(Boolean).length}/${SCENES.length}`);
}

main().catch(console.error);
