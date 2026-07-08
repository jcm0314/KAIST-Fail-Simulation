const fs = require('fs');
const path = require('path');
const { EdgeTTS } = require('node-edge-tts');

const audioDir = path.join(__dirname, 'audio');
if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir);
}

// Dialogues mapping using high-quality Microsoft Edge Neural Voices (including Narrator / SYSTEM)
const dialogues = [
    // Narration
    { file: "system_1.mp3", voice: "ko-KR-SunHiNeural", text: "2036년 7월 1일. 서울 중앙 의료센터." },
    { file: "system_2.mp3", voice: "ko-KR-SunHiNeural", text: "당신은 2026년 교통사고 이후 의식을 잃었다가 10년 만에 깨어났다." },
    { file: "system_3.mp3", voice: "ko-KR-SunHiNeural", text: "병원을 나온 당신은 낯선 서울 거리를 걷기 시작했다." },
    { file: "system_4.mp3", voice: "ko-KR-SunHiNeural", text: "횡단보도 앞. 한 노인이 갑자기 쓰러졌다." },
    { file: "system_5.mp3", voice: "ko-KR-SunHiNeural", text: "주변 사람들은 힐끗 바라볼 뿐 아무도 움직이지 않는다." },
    { file: "system_6.mp3", voice: "ko-KR-SunHiNeural", text: "당신은 어떻게 행동할 것인가?" },
    { file: "system_7.mp3", voice: "ko-KR-SunHiNeural", text: "드론이 와서 환자를 이송한다." },
    { file: "system_8.mp3", voice: "ko-KR-SunHiNeural", text: "며칠 뒤, 당신은 과거의 지인이 세상을 떠났다는 연락을 받는다." },
    { file: "system_9.mp3", voice: "ko-KR-SunHiNeural", text: "하지만 모바일 안내장에는 장례식장이라는 단어 대신 ‘이주식’이라는 낯선 단어가 적혀 있었다." },
    { file: "system_10.mp3", voice: "ko-KR-SunHiNeural", text: "이주센터에 도착한 당신. 빈소는 텅 비어 있고, 조문객은 다섯 명 남짓뿐이다." },
    { file: "system_11.mp3", voice: "ko-KR-SunHiNeural", text: "빈소 중앙의 스크린이 켜지며, 방금 세상을 떠난 지인의 모습이 나타난다. 표정과 목소리, 생각까지 생전과 똑같은 완벽한 복제본이다." },
    { file: "system_12.mp3", voice: "ko-KR-SunHiNeural", text: "사람들은 슬퍼하며 눈물을 흘리는 대신, 태블릿을 켜서 지인의 복제본과 일상적인 대화를 나누기 시작한다." },
    { file: "system_13.mp3", voice: "ko-KR-SunHiNeural", text: "죽음이 흔해지고 언제든 되돌릴 수 있는 일이 된 사회. 살아있는 사람들의 하루도 그만큼 가볍고 사소해져 있었다." },
    { file: "system_14.mp3", voice: "ko-KR-SunHiNeural", text: "지인의 복제본이 당신에게 대화를 요청했다. 당신은 어떻게 반응할 것인가?" },
    { file: "system_15.mp3", voice: "ko-KR-SunHiNeural", text: "그날 이후, 당신은 매일 태블릿을 켜 지인의 복제본을 부르고 일상적인 대화를 나누기 시작했다." },
    { file: "system_16.mp3", voice: "ko-KR-SunHiNeural", text: "하지만 심리 전문가들의 경고처럼, 그것은 애도를 돕는 것이 아니라 지연시키는 과정일 뿐이었다." },
    { file: "system_17.mp3", voice: "ko-KR-SunHiNeural", text: "곁에 그 존재가 계속 '있으니' 부재가 처리되지 않았고, 당신은 애도의 첫 단계인 부정에 머문 채 끝내 작별하지 못했다." },
    { file: "system_18.mp3", voice: "ko-KR-SunHiNeural", text: "구독료로 슬픔을 계속 붙잡아두는 거대한 사업 모델에 당신도 완벽히 편입되고 말았다." },
    { file: "system_19.mp3", voice: "ko-KR-SunHiNeural", text: "시간이 흐르며, 누군가 세상을 떠나도 다시 만날 수 있다는 생각이 만연해지자 당신 역시 타인의 죽음을 상실로 받아들이지 않게 되었다." },
    { file: "system_20.mp3", voice: "ko-KR-SunHiNeural", text: "당신은 복제본과의 대화를 끊고 뒤돌아섰다." },
    { file: "system_21.mp3", voice: "ko-KR-SunHiNeural", text: "당신은 단호한 거절을 한 뒤 죽음이 되돌릴 수 있는 일이 되며 생명의 무게가 지워졌던 2036년의 사회에 작은 파문을 일으켰다." },
    { file: "system_22.mp3", voice: "ko-KR-SunHiNeural", text: "이후 당신은 '데스 리터러시(death literacy)' 교육을 정규 교육과정에 넣어야 한다고 목소리를 내기 시작했다." },
    { file: "system_23.mp3", voice: "ko-KR-SunHiNeural", text: "또한 생전 본인의 의사로 사후 복제를 금지할 수 있는 '디지털 소생 거부(DDNR)' 조항을 법제화하는 시민운동에 뛰어들었다." },

    // Character Dialogues
    { file: "protagonist_1.mp3", voice: "ko-KR-InJoonNeural", text: "…… 여기가 어디지…?" },
    { file: "doctor_1.mp3", voice: "ko-KR-HyunsuNeural", text: "정신이 드셨군요 환자분. 환자분은 10년만에 깨어나 현재 2036년입니다." },
    { file: "protagonist_2.mp3", voice: "ko-KR-InJoonNeural", text: "2036년...? 무슨 소리죠?" },
    { file: "doctor_2.mp3", voice: "ko-KR-HyunsuNeural", text: "많이 달라졌겠지만 곧 익숙해질 겁니다." },
    { file: "protagonist_3.mp3", voice: "ko-KR-InJoonNeural", text: "누군가 119 좀 불러주세요!" },
    { file: "pedestrian_1.mp3", voice: "ko-KR-InJoonNeural", text: "왜요?" },
    { file: "protagonist_4.mp3", voice: "ko-KR-InJoonNeural", text: "죽을 수도 있잖아요!" },
    { file: "pedestrian_2.mp3", voice: "ko-KR-InJoonNeural", text: "죽으면 업로드하면 되는데요?" },
    { file: "pedestrian_3.mp3", voice: "ko-KR-InJoonNeural", text: "곧 죽겠네." },
    { file: "pedestrian_4.mp3", voice: "ko-KR-InJoonNeural", text: "이주는 해놨겠지…" },
    { file: "protagonist_5.mp3", voice: "ko-KR-InJoonNeural", text: "...?" },
    { file: "protagonist_6.mp3", voice: "ko-KR-InJoonNeural", text: "이게... 장례식라고? 사람이 왜 이렇게 없지?" },
    { file: "sangju_1.mp3", voice: "ko-KR-InJoonNeural", text: "다들 직접 오진 않고 '추모 메시지'만 보냈으니까요. 어차피 AI가 고인 말투로 자동 답장해주잖아요." },
    { file: "protagonist_7.mp3", voice: "ko-KR-InJoonNeural", text: "자동 답장이라니... 다들 슬프지도 않은 건가요?" },
    { file: "visitor_1.mp3", voice: "ko-KR-InJoonNeural", text: "요즘 누가 번거롭게 삼일장을 치러요. 반나절이면 다 끝나는 '이주식'이 보편화된 지 오래인데." },
    { file: "clone_1.mp3", voice: "ko-KR-SunHiNeural", text: "와줘서 고마워. 다들 너무 슬퍼하지 마. 어차피 이렇게 복제본 잘 만들어 놨으니 괜찮아." },
    { file: "protagonist_8.mp3", voice: "ko-KR-InJoonNeural", text: "너... 죽은 거 아니었어?" },
    { file: "clone_2.mp3", voice: "ko-KR-SunHiNeural", text: "내 몸은 죽었지만 내 기억과 의식은 넘어와서 살아 있는거라고 할 수 있지. 죽음은 이제 이별이 아니라 또 다른 만남일 뿐이야." },
    { file: "clone_3.mp3", voice: "ko-KR-SunHiNeural", text: "오랜만이야, 너보다 내가 먼저 죽었네" },
    { file: "protagonist_9.mp3", voice: "ko-KR-InJoonNeural", text: "어... 그래. 네가 죽었다는 게 아직도 실감이 안 나는데, 이렇게 눈앞에서 목소리를 들으니까 기분이 이상하네." },
    { file: "clone_4.mp3", voice: "ko-KR-SunHiNeural", text: "너무 슬퍼 마, 복제본 잘 만들어 놨잖아. 죽기 전에 의식과 기억을 미리 다 옮겨놨거든." },
    { file: "protagonist_10.mp3", voice: "ko-KR-InJoonNeural", text: "그래... 이렇게라도 계속 이야기할 수 있다면 좋은 거겠지..." },
    { file: "protagonist_11.mp3", voice: "ko-KR-InJoonNeural", text: "아니... 거절할게. 넌 내 친구의 기억을 가졌지만, 진짜 내 친구는 아니야." },
    { file: "clone_5.mp3", voice: "ko-KR-SunHiNeural", text: "왜 그래? 난 너랑 이렇게 대화할 수 있고, 예전과 똑같이 생각하고 반응하는데. 죽음은 이제 끝이 아니잖아." },
    { file: "protagonist_12.mp3", voice: "ko-KR-InJoonNeural", text: "그건 가짜 위로일 뿐이야. 네 육신이 죽었는데 끝없이 대화하는 건, 진정한 작별을 회피하는 거라고." }
];

async function generateAll() {
    console.log("Starting Edge Neural TTS voice generation (narrative + dialogue)...");
    
    const clients = {
        "ko-KR-InJoonNeural": new EdgeTTS({ voice: "ko-KR-InJoonNeural", lang: "ko-KR" }),
        "ko-KR-SunHiNeural": new EdgeTTS({ voice: "ko-KR-SunHiNeural", lang: "ko-KR" }),
        "ko-KR-HyunsuNeural": new EdgeTTS({ voice: "ko-KR-HyunsuNeural", lang: "ko-KR" })
    };
    
    const fallbackClient = new EdgeTTS({ voice: "ko-KR-InJoonNeural", lang: "ko-KR" });

    for (let i = 0; i < dialogues.length; i++) {
        const d = dialogues[i];
        const outputPath = path.join(audioDir, d.file);
        let client = clients[d.voice] || fallbackClient;
        
        console.log(`[${i + 1}/${dialogues.length}] Generating ${d.file} using ${d.voice}...`);
        try {
            await client.ttsPromise(d.text, outputPath);
        } catch (err) {
            console.warn(`Warning: failed to generate with ${d.voice}, trying fallback InJoon...`);
            try {
                await fallbackClient.ttsPromise(d.text, outputPath);
            } catch (err2) {
                console.error(`Error: failed to generate ${d.file} completely:`, err2);
            }
        }
    }
    
    console.log("Voice generation completed successfully.");
}

generateAll().catch(err => {
    console.error("Fatal error in voice generation script:", err);
});
