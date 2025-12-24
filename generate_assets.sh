#!/bin/bash
# 资源预生成脚本

SPEECH_KEY="xxx"
SPEECH_ENDPOINT="https://xxx/tts/cognitiveservices/v1"

IMAGE_TOKEN="xxx"
IMAGE_ENDPOINT="https://api.coze.cn/v1/workflow/run"
IMAGE_WORKFLOW="xxx"

mkdir -p assets/voice assets/images

echo "=== 雪山庄杀人事件 - 资源预生成 ==="
echo ""

# 生成图片函数
gen_image() {
    local id=$1
    local prompt=$2
    
    response=$(curl -s -X POST "$IMAGE_ENDPOINT" \
        -H "Authorization: Bearer $IMAGE_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"workflow_id\":\"$IMAGE_WORKFLOW\",\"parameters\":{\"prompt\":\"$prompt\"}}")
    
    url=$(echo "$response" | grep -o 'https://s\.coze\.cn/t/[^/]*/' | head -1)
    
    if [ -n "$url" ]; then
        curl -s -L "$url" -o "assets/images/${id}.jpg"
        if [ -s "assets/images/${id}.jpg" ]; then
            echo "OK $id"
        else
            echo "FAIL $id (download)"
        fi
    else
        echo "FAIL $id: $response"
    fi
    sleep 2
}

echo "【生成场景图片】"
gen_image "scene1" "雪夜山庄外景，暴风雪中的神秘欧式别墅，动漫风格，悬疑氛围"
gen_image "scene2" "豪华欧式客厅，壁炉燃烧，暖色调，案发现场，悬疑氛围，动漫风格"
gen_image "scene3" "古典书房内部，大书架，暗红色调，神秘气氛，动漫风格"
echo ""

# 生成语音函数
gen() {
    local id=$1
    local voice=$2
    local text=$3
    
    local ssml="<speak version=\"1.0\" xmlns=\"http://www.w3.org/2001/10/synthesis\" xml:lang=\"zh-CN\"><voice name=\"$voice\">$text</voice></speak>"
    
    curl -s -X POST "$SPEECH_ENDPOINT" \
        -H "Ocp-Apim-Subscription-Key: $SPEECH_KEY" \
        -H "Content-Type: application/ssml+xml" \
        -H "X-Microsoft-OutputFormat: audio-16khz-128kbitrate-mono-mp3" \
        -d "$ssml" \
        -o "assets/voice/${id}.mp3"
    
    if [ -s "assets/voice/${id}.mp3" ]; then
        local size=$(wc -c < "assets/voice/${id}.mp3" | tr -d ' ')
        if [ "$size" -gt 1000 ]; then
            echo "OK $id"
        else
            echo "FAIL $id (too small)"
            rm -f "assets/voice/${id}.mp3"
        fi
    else
        echo "FAIL $id"
        rm -f "assets/voice/${id}.mp3"
    fi
    sleep 0.2
}

# 语音列表 (id voice text)
echo "【生成角色语音】"

# 旁白 - YunyeNeural
gen "narr_01" "zh-CN-YunyeNeural" "大雪纷飞的夜晚，我接到一通神秘电话，赶往偏远的雪山庄。"
gen "narr_02" "zh-CN-YunyeNeural" "当我抵达时，这座百年别墅的主人白鹤先生，已经死在了他的书房里。"
gen "narr_03" "zh-CN-YunyeNeural" "我来到书房，白鹤先生的尸体已被移走，但现场保留完好。"
gen "narr_04" "zh-CN-YunyeNeural" "我回到客厅，四位嫌疑人都在等候。是时候进行问询了。"
gen "narr_05" "zh-CN-YunyeNeural" "我的推理出现了漏洞，真凶趁机逃脱了。"
gen "narr_06" "zh-CN-YunyeNeural" "警察在暴风雪停止后抵达，带走了小雪。"
gen "narr_07" "zh-CN-YunyeNeural" "雪山庄杀人事件，就此落幕。"

# 管家 - YunyangNeural
gen "butler_01" "zh-CN-YunyangNeural" "侦探先生，感谢您冒着暴风雪前来。我是这里的管家，老张。"
gen "butler_02" "zh-CN-YunyangNeural" "今晚八点，我发现老爷倒在书房。门是从里面反锁的，我们破门而入时，他已经没有呼吸了。"
gen "butler_03" "zh-CN-YunyangNeural" "除了我，还有夫人、少爷，以及一位新来的女仆小雪。暴风雪已经封锁了所有道路，没人能够离开。"
gen "butler_04" "zh-CN-YunyangNeural" "侦探先生，您在开玩笑吧？我服侍老爷三十年，怎么可能害他？"
gen "butler_05" "zh-CN-YunyangNeural" "但我七点半在给夫人送药，有夫人作证。而且老爷的茶都是他自己泡的，从不让人插手。"
gen "butler_06" "zh-CN-YunyangNeural" "确实，我七点半给夫人送药时，她一直在卧室，直到我发现老爷出事才叫她出来。"

# 侦探 - YunxiNeural
gen "det_01" "zh-CN-YunxiNeural" "先简单说明一下情况吧。"
gen "det_02" "zh-CN-YunxiNeural" "目前庄内有哪些人？"
gen "det_03" "zh-CN-YunxiNeural" "这是一个密室，凶手一定还在这栋别墅里。"
gen "det_04" "zh-CN-YunxiNeural" "书桌上有一杯喝了一半的红茶，杯底有白色残留物。"
gen "det_05" "zh-CN-YunxiNeural" "还有一封信，是一份遗嘱草稿！"
gen "det_06" "zh-CN-YunxiNeural" "将全部财产留给我新认的女儿，名字被墨水污损了。"
gen "det_07" "zh-CN-YunxiNeural" "窗户虚掩着，外面是鹅毛大雪。窗台上有少量融化的雪水。"
gen "det_08" "zh-CN-YunxiNeural" "有人从这里进出过？不，以这种暴风雪，从外面攀爬几乎不可能。"
gen "det_09" "zh-CN-YunxiNeural" "这扇窗是凶手故意打开的，想制造外人入侵的假象。"
gen "det_10" "zh-CN-YunxiNeural" "地毯上有几处不太明显的泥土痕迹，颜色很新鲜。"
gen "det_11" "zh-CN-YunxiNeural" "这些泥土似乎是从门口延伸进来的。有人近期穿着沾泥的鞋子进入过这里。"
gen "det_12" "zh-CN-YunxiNeural" "晚上八点您在哪里？"
gen "det_13" "zh-CN-YunxiNeural" "您晚上在做什么？"
gen "det_14" "zh-CN-YunxiNeural" "你来这里多久了？"
gen "det_15" "zh-CN-YunxiNeural" "晚上八点你在哪里？"
gen "det_16" "zh-CN-YunxiNeural" "我注意到她的手指有些颤抖，她在害怕什么？"
gen "det_17" "zh-CN-YunxiNeural" "你的手套呢？我看到其他仆人都戴着白手套。"
gen "det_18" "zh-CN-YunxiNeural" "让我整理一下目前掌握的线索。"
gen "det_19" "zh-CN-YunxiNeural" "红茶中的毒药，遗嘱上的新认的女儿，你欠我的总要还，沾脏的手套。"
gen "det_20" "zh-CN-YunxiNeural" "真相只有一个！"
gen "det_21" "zh-CN-YunxiNeural" "各位，我已经知道凶手是谁了。"
gen "det_22" "zh-CN-YunxiNeural" "你有机会在红茶里下毒！"
gen "det_23" "zh-CN-YunxiNeural" "你可以让别人替你玩。"
gen "det_24" "zh-CN-YunxiNeural" "凶手就是你，小雪，或者我应该叫你，白雪？"
gen "det_25" "zh-CN-YunxiNeural" "白鹤先生二十多年前抛弃了一个女人和她腹中的孩子。那个孩子就是你。"
gen "det_26" "zh-CN-YunxiNeural" "遗嘱上写着新认的女儿，白鹤先生认出了你，想要弥补，所以打算把财产留给你。"
gen "det_27" "zh-CN-YunxiNeural" "你趁着给他送茶的机会在红茶里下毒。你的手套上沾了花园的泥土，因为你从花园采了毒草。"
gen "det_28" "zh-CN-YunxiNeural" "然后你打开窗户，想制造外人入侵的假象。但窗台上的雪水说明，窗户是在案发后才被打开的。"

# 夫人 - XiaoxiaoNeural
gen "wife_01" "zh-CN-XiaoxiaoNeural" "侦探先生，我和丈夫确实感情不和，但我绝不会杀他。"
gen "wife_02" "zh-CN-XiaoxiaoNeural" "我一直在卧室休息。管家可以作证，他七点半给我送过药。"
gen "wife_03" "zh-CN-XiaoxiaoNeural" "倒是那个新来的女仆，她总是鬼鬼祟祟的。而且我丈夫最近总是对她特别关照。"
gen "wife_04" "zh-CN-XiaoxiaoNeural" "你说什么？！我有不在场证明！"

# 少爷 - YunjianNeural
gen "son_01" "zh-CN-YunjianNeural" "哼，我知道你们怀疑我。我确实需要钱，但我不会杀自己的父亲。"
gen "son_02" "zh-CN-YunjianNeural" "我在自己房间打游戏！你可以查我的游戏记录。"
gen "son_03" "zh-CN-YunjianNeural" "对了，我前天偷听到父亲和那个女仆吵架。女仆说，你欠我的，总要还的。"
gen "son_04" "zh-CN-YunjianNeural" "开什么玩笑！我的游戏记录可以证明我七点到九点一直在线上！"
gen "son_05" "zh-CN-YunjianNeural" "哈？那局排位我连赢五把，除了我谁能打出这种操作？"

# 女仆 - XiaohanNeural
gen "maid_01" "zh-CN-XiaohanNeural" "侦探先生好。我只是一个普通的女仆。"
gen "maid_02" "zh-CN-XiaohanNeural" "才三个月。是老爷亲自面试录用我的。"
gen "maid_03" "zh-CN-XiaohanNeural" "我在厨房准备明天的食材。"
gen "maid_04" "zh-CN-XiaohanNeural" "啊，弄脏了，我换了一副。脏的那副应该还在厨房。"
gen "maid_05" "zh-CN-XiaohanNeural" "弥补？哈，我母亲因为他郁郁而终！他以为一份遗嘱就能抹去一切？"
gen "maid_06" "zh-CN-XiaohanNeural" "你说得对。我恨他，恨了二十年。但当他倒下的那一刻，我却感到一阵空虚。"
gen "maid_07" "zh-CN-XiaohanNeural" "我杀了他，却也永远失去了真正了解他的机会。这就是复仇的代价吧。"

echo ""
echo "【生成资源映射】"

# 生成 asset_map.json
echo '{' > assets/asset_map.json
echo '  "voices": {' >> assets/asset_map.json

first=true
for f in assets/voice/*.mp3; do
    if [ -f "$f" ]; then
        id=$(basename "$f" .mp3)
        if [ "$first" = true ]; then
            first=false
        else
            echo ',' >> assets/asset_map.json
        fi
        printf "    \"$id\": \"assets/voice/${id}.mp3\"" >> assets/asset_map.json
    fi
done

echo '' >> assets/asset_map.json
echo '  },' >> assets/asset_map.json
echo '  "images": {' >> assets/asset_map.json

first=true
for f in assets/images/*.jpg; do
    if [ -f "$f" ]; then
        id=$(basename "$f" .jpg)
        if [ "$first" = true ]; then
            first=false
        else
            echo ',' >> assets/asset_map.json
        fi
        printf "    \"$id\": \"assets/images/${id}.jpg\"" >> assets/asset_map.json
    fi
done

echo '' >> assets/asset_map.json
echo '  }' >> assets/asset_map.json
echo '}' >> assets/asset_map.json

echo "OK assets/asset_map.json"

echo ""
echo "=== 完成 ==="
voice_count=$(ls -1 assets/voice/*.mp3 2>/dev/null | wc -l | tr -d ' ')
image_count=$(ls -1 assets/images/*.jpg 2>/dev/null | wc -l | tr -d ' ')
echo "语音: $voice_count 个"
echo "图片: $image_count 个"
