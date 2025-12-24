// 雪山庄事件 - 游戏剧情脚本（预加载资源版本）

const gameScript = [
    // ========== 序章：案发 ==========
    { type: 'background', image: 'scene1' },
    
    { type: 'dialog', speaker: '旁白', text: '大雪纷飞的夜晚，我接到一通神秘电话，赶往偏远的雪山庄。', voice: 'narr_01' },
    { type: 'dialog', speaker: '旁白', text: '当我抵达时，这座百年别墅的主人——白鹤先生，已经死在了他的书房里。', voice: 'narr_02' },
    
    { type: 'background', image: 'scene2' },
    
    { type: 'dialog', speaker: '管家', text: '侦探先生，感谢您冒着暴风雪前来。我是这里的管家，老张。', voice: 'butler_01' },
    { type: 'dialog', speaker: '侦探', text: '先简单说明一下情况吧。', voice: 'det_01' },
    { type: 'dialog', speaker: '管家', text: '今晚八点，我发现老爷倒在书房。门是从里面反锁的，我们破门而入时...他已经没有呼吸了。', voice: 'butler_02' },
    
    { type: 'clue', clue: '死亡时间：晚上8点左右' },
    
    { type: 'dialog', speaker: '侦探', text: '目前庄内有哪些人？', voice: 'det_02' },
    { type: 'dialog', speaker: '管家', text: '除了我，还有夫人、少爷，以及一位新来的女仆小雪。暴风雪已经封锁了所有道路，没人能够离开。', voice: 'butler_03' },
    
    { type: 'clue', clue: '嫌疑人共4人：管家、夫人、少爷、女仆' },
    
    { type: 'dialog', speaker: '侦探', text: '（这是一个密室...凶手一定还在这栋别墅里。）', voice: 'det_03' },
    
    // ========== 第一章：调查现场 ==========
    { type: 'background', image: 'scene3' },
    
    { type: 'dialog', speaker: '旁白', text: '我来到书房，白鹤先生的尸体已被移走，但现场保留完好。', voice: 'narr_03' },
    
    // --- 调查选择 ---
    { label: 'investigate_choice', type: 'choice', choices: [
        { text: '检查书桌', jump: 'check_desk' },
        { text: '检查窗户', jump: 'check_window' },
        { text: '检查地面', jump: 'check_floor' },
        { text: '【调查完毕，去问询嫌疑人】', jump: 'after_investigation' }
    ]},
    
    // --- 检查书桌 ---
    { label: 'check_desk', type: 'dialog', speaker: '侦探', text: '书桌上有一杯喝了一半的红茶...杯底有白色残留物。', voice: 'det_04' },
    { type: 'clue', clue: '红茶杯中有可疑白色粉末残留' },
    { type: 'dialog', speaker: '侦探', text: '还有一封信...是一份遗嘱草稿！', voice: 'det_05' },
    { type: 'dialog', speaker: '侦探', text: '"...将全部财产留给我新认的女儿..."名字被墨水污损了。', voice: 'det_06' },
    { type: 'clue', clue: '遗嘱草稿：白鹤先生打算将财产留给"新认的女儿"' },
    { type: 'dialog', speaker: '侦探', text: '（还有其他地方需要调查吗？）' },
    { type: 'jump', label: 'investigate_choice' },
    
    // --- 检查窗户 ---
    { label: 'check_window', type: 'dialog', speaker: '侦探', text: '窗户虚掩着，外面是鹅毛大雪。窗台上有少量融化的雪水。', voice: 'det_07' },
    { type: 'clue', clue: '书房窗户半开，窗台有雪水痕迹' },
    { type: 'dialog', speaker: '侦探', text: '有人从这里进出过？不...以这种暴风雪，从外面攀爬几乎不可能。', voice: 'det_08' },
    { type: 'dialog', speaker: '侦探', text: '这扇窗是凶手故意打开的，想制造外人入侵的假象。', voice: 'det_09' },
    { type: 'clue', clue: '推理：窗户是为了误导调查方向' },
    { type: 'dialog', speaker: '侦探', text: '（还有其他地方需要调查吗？）' },
    { type: 'jump', label: 'investigate_choice' },
    
    // --- 检查地面 ---
    { label: 'check_floor', type: 'dialog', speaker: '侦探', text: '地毯上有几处不太明显的泥土痕迹...颜色很新鲜。', voice: 'det_10' },
    { type: 'clue', clue: '地毯上有新鲜泥土痕迹' },
    { type: 'dialog', speaker: '侦探', text: '这些泥土似乎是从门口延伸进来的。有人近期穿着沾泥的鞋子进入过这里。', voice: 'det_11' },
    { type: 'dialog', speaker: '侦探', text: '（还有其他地方需要调查吗？）' },
    { type: 'jump', label: 'investigate_choice' },
    
    // ========== 第二章：问询嫌疑人 ==========
    { label: 'after_investigation', type: 'background', image: 'scene2' },
    { type: 'bgm', bgm: 'dialogue' }, // 切换到对话场景BGM
    { type: 'dialog', speaker: '旁白', text: '我回到客厅，四位嫌疑人都在等候。是时候进行问询了。', voice: 'narr_04' },
    
    // --- 问询选择 ---
    { label: 'question_choice', type: 'choice', choices: [
        { text: '询问夫人', jump: 'ask_wife' },
        { text: '询问少爷', jump: 'ask_son' },
        { text: '询问女仆', jump: 'ask_maid' },
        { text: '【问询完毕，开始推理】', jump: 'after_questioning' }
    ]},
    
    // --- 询问夫人 ---
    { label: 'ask_wife', type: 'dialog', speaker: '夫人', text: '侦探先生...我和丈夫确实感情不和，但我绝不会杀他。', voice: 'wife_01' },
    { type: 'dialog', speaker: '侦探', text: '晚上八点您在哪里？', voice: 'det_12' },
    { type: 'dialog', speaker: '夫人', text: '我一直在卧室休息。管家可以作证，他七点半给我送过药。', voice: 'wife_02' },
    { type: 'clue', clue: '夫人不在场证明：管家7:30送药' },
    { type: 'dialog', speaker: '夫人', text: '倒是那个新来的女仆...她总是鬼鬼祟祟的。而且我丈夫最近总是对她特别关照。', voice: 'wife_03' },
    { type: 'clue', clue: '情报：白鹤先生对女仆小雪特别关照' },
    { type: 'dialog', speaker: '侦探', text: '（还需要问询其他人吗？）' },
    { type: 'jump', label: 'question_choice' },
    
    // --- 询问少爷 ---
    { label: 'ask_son', type: 'dialog', speaker: '少爷', text: '哼，我知道你们怀疑我。我确实需要钱，但我不会杀自己的父亲。', voice: 'son_01' },
    { type: 'dialog', speaker: '侦探', text: '您晚上在做什么？', voice: 'det_13' },
    { type: 'dialog', speaker: '少爷', text: '我在自己房间打游戏！你可以查我的游戏记录。', voice: 'son_02' },
    { type: 'clue', clue: '少爷称有游戏记录可证明不在场' },
    { type: 'dialog', speaker: '少爷', text: '对了，我前天偷听到父亲和那个女仆吵架。女仆说..."你欠我的，总要还的"。', voice: 'son_03' },
    { type: 'clue', clue: '关键情报：女仆曾对白鹤先生说"你欠我的总要还"' },
    { type: 'dialog', speaker: '侦探', text: '（还需要问询其他人吗？）' },
    { type: 'jump', label: 'question_choice' },
    
    // --- 询问女仆 ---
    { label: 'ask_maid', type: 'dialog', speaker: '女仆', text: '侦探先生好。我...我只是一个普通的女仆。', voice: 'maid_01' },
    { type: 'dialog', speaker: '侦探', text: '你来这里多久了？', voice: 'det_14' },
    { type: 'dialog', speaker: '女仆', text: '才三个月。是老爷亲自面试录用我的。', voice: 'maid_02' },
    { type: 'dialog', speaker: '侦探', text: '晚上八点你在哪里？', voice: 'det_15' },
    { type: 'dialog', speaker: '女仆', text: '我...我在厨房准备明天的食材。', voice: 'maid_03' },
    { type: 'clue', clue: '女仆称案发时在厨房' },
    { type: 'dialog', speaker: '侦探', text: '（我注意到她的手指有些颤抖...她在害怕什么？）', voice: 'det_16' },
    { type: 'dialog', speaker: '侦探', text: '你的手套呢？我看到其他仆人都戴着白手套。', voice: 'det_17' },
    { type: 'dialog', speaker: '女仆', text: '啊...弄脏了，我换了一副。脏的那副...应该还在厨房。', voice: 'maid_04' },
    { type: 'clue', clue: '女仆的手套沾脏需要更换' },
    { type: 'dialog', speaker: '侦探', text: '（还需要问询其他人吗？）' },
    { type: 'jump', label: 'question_choice' },
    
    // ========== 第三章：最终推理 ==========
    { label: 'after_questioning', type: 'dialog', speaker: '侦探', text: '（让我整理一下目前掌握的线索...）', voice: 'det_18' },
    { type: 'dialog', speaker: '侦探', text: '红茶中的毒药...遗嘱上的"新认的女儿"..."你欠我的总要还"...沾脏的手套...', voice: 'det_19' },
    { type: 'dialog', speaker: '侦探', text: '（真相只有一个！）', voice: 'det_20' },

    { type: 'bgm', bgm: 'reveal' }, // 切换到真相揭露高潮BGM
    { type: 'dialog', speaker: '侦探', text: '各位，我已经知道凶手是谁了。', voice: 'det_21' },
    
    { type: 'choice', choices: [
        { text: '指认管家', jump: 'accuse_butler', flag: 'accused', value: 'butler' },
        { text: '指认夫人', jump: 'accuse_wife', flag: 'accused', value: 'wife' },
        { text: '指认少爷', jump: 'accuse_son', flag: 'accused', value: 'son' },
        { text: '指认女仆', jump: 'accuse_maid', flag: 'accused', value: 'maid' }
    ]},
    
    // --- 错误结局：管家 ---
    { label: 'accuse_butler', type: 'dialog', speaker: '管家', text: '侦探先生，您在开玩笑吧？我服侍老爷三十年，怎么可能害他？', voice: 'butler_04' },
    { type: 'dialog', speaker: '侦探', text: '你有机会在红茶里下毒！', voice: 'det_22' },
    { type: 'dialog', speaker: '管家', text: '但我七点半在给夫人送药，有夫人作证。而且老爷的茶都是他自己泡的，从不让人插手。', voice: 'butler_05' },
    { type: 'dialog', speaker: '旁白', text: '我的推理出现了漏洞...真凶趁机逃脱了。', voice: 'narr_05' },
    { type: 'ending', title: 'BAD END', text: '推理失败。真凶在暴风雪停止后离开了山庄，此案成为悬案。' },
    
    // --- 错误结局：夫人 ---
    { label: 'accuse_wife', type: 'dialog', speaker: '夫人', text: '你说什么？！我有不在场证明！', voice: 'wife_04' },
    { type: 'dialog', speaker: '管家', text: '确实，我七点半给夫人送药时，她一直在卧室，直到我发现老爷出事才叫她出来。', voice: 'butler_06' },
    { type: 'dialog', speaker: '旁白', text: '我的推理出现了漏洞...真凶趁机逃脱了。', voice: 'narr_05' },
    { type: 'ending', title: 'BAD END', text: '推理失败。真凶在暴风雪停止后离开了山庄，此案成为悬案。' },
    
    // --- 错误结局：少爷 ---
    { label: 'accuse_son', type: 'dialog', speaker: '少爷', text: '开什么玩笑！我的游戏记录可以证明我七点到九点一直在线上！', voice: 'son_04' },
    { type: 'dialog', speaker: '侦探', text: '你可以让别人替你玩...', voice: 'det_23' },
    { type: 'dialog', speaker: '少爷', text: '哈？那局排位我连赢五把，除了我谁能打出这种操作？', voice: 'son_05' },
    { type: 'dialog', speaker: '旁白', text: '我的推理出现了漏洞...真凶趁机逃脱了。', voice: 'narr_05' },
    { type: 'ending', title: 'BAD END', text: '推理失败。真凶在暴风雪停止后离开了山庄，此案成为悬案。' },
    
    // --- 正确结局：女仆 ---
    { label: 'accuse_maid', type: 'dialog', speaker: '侦探', text: '凶手就是你——小雪，或者我应该叫你...白雪？', voice: 'det_24' },
    { type: 'dialog', speaker: '女仆', text: '！！！' },
    { type: 'dialog', speaker: '侦探', text: '白鹤先生二十多年前抛弃了一个女人和她腹中的孩子。那个孩子就是你。', voice: 'det_25' },
    { type: 'dialog', speaker: '侦探', text: '遗嘱上写着"新认的女儿"——白鹤先生认出了你，想要弥补，所以打算把财产留给你。', voice: 'det_26' },
    { type: 'dialog', speaker: '女仆', text: '弥补？哈...我母亲因为他郁郁而终！他以为一份遗嘱就能抹去一切？', voice: 'maid_05' },
    { type: 'dialog', speaker: '侦探', text: '你趁着给他送茶的机会在红茶里下毒。你的手套上沾了花园的泥土，因为你从花园采了毒草。', voice: 'det_27' },
    { type: 'dialog', speaker: '侦探', text: '然后你打开窗户，想制造外人入侵的假象。但窗台上的雪水说明，窗户是在案发后才被打开的。', voice: 'det_28' },
    { type: 'dialog', speaker: '女仆', text: '......' },
    { type: 'dialog', speaker: '女仆', text: '你说得对。我恨他...恨了二十年。但当他倒下的那一刻，我却感到一阵空虚。', voice: 'maid_06' },
    { type: 'dialog', speaker: '女仆', text: '我杀了他...却也永远失去了真正了解他的机会。这就是复仇的代价吧。', voice: 'maid_07' },
    { type: 'dialog', speaker: '旁白', text: '警察在暴风雪停止后抵达，带走了小雪。', voice: 'narr_06' },
    { type: 'dialog', speaker: '旁白', text: '雪山庄事件...就此落幕。', voice: 'narr_07' },
    
    { type: 'ending', title: 'TRUE END', text: '恭喜你揭开了真相。\n\n仇恨与执念，往往会让人迷失自我。当复仇完成的那一刻，留下的只有无尽的虚空。\n\n——《雪山庄事件》完' }
];
