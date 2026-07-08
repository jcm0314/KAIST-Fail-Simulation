// STATE VARIABLES
const state = {
    mourning: 32,
    dependent: 45,
    compliance: 38,
    scriptIndex: 0,
    isTyping: false,
    typingTimeout: null,
    currentText: "",
    choicesMade: []
};

// DOM ELEMENTS
const elTitleScreen = document.getElementById('title-screen');
const elPlayScreen = document.getElementById('play-screen');
const elEndingScreen = document.getElementById('ending-screen');
const elStartBtn = document.getElementById('start-btn');
const elRestartBtn = document.getElementById('restart-btn');

const elSpeakerTag = document.getElementById('speaker-tag');
const elDialogBox = document.getElementById('dialog-box');
const elDialogText = document.getElementById('dialog-text');
const elNextIndicator = document.getElementById('next-indicator');
const elChoicesOverlay = document.getElementById('choices-overlay');
const elChoicesContainer = document.getElementById('choices-container');

const elHologramFlicker = document.getElementById('hologram-flicker');
const elSoundBtn = document.getElementById('sound-btn');
const elLogList = document.getElementById('log-list');
const elSceneTitle = document.getElementById('scene-title');

// STAT BARS
const barMourning = document.querySelector('#stat-mourning .stat-bar');
const valMourning = document.querySelector('#stat-mourning .stat-value');
const barDependent = document.querySelector('#stat-dependent .stat-bar');
const valDependent = document.querySelector('#stat-dependent .stat-value');
const barCompliance = document.querySelector('#stat-compliance .stat-bar');
const valCompliance = document.querySelector('#stat-compliance .stat-value');

// WEB AUDIO BGM SYNTHESIZER (Scary, dark horror low drone)
let audioCtx = null;
let synthGain = null;
let oscillators = [];
let isMuted = true;

function initSynth() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, audioCtx.currentTime); // Low low-pass to make it muffled and scary
    
    synthGain = audioCtx.createGain();
    synthGain.gain.setValueAtTime(0, audioCtx.currentTime);
    
    // Creepy dissonance chord: E1(41.2Hz), B1(58.27Hz), F2(87.31Hz) - Tritone detuned
    const frequencies = [41.2, 58.27, 87.31, 110];
    frequencies.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();
        
        osc.type = idx % 2 === 0 ? 'sine' : 'sawtooth'; // Sawtooth filtered is heavy
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.detune.setValueAtTime(idx * 7 - 10, audioCtx.currentTime); // High detune for heavy horror dissonance
        
        oscGain.gain.setValueAtTime(0.22, audioCtx.currentTime);
        
        osc.connect(oscGain);
        oscGain.connect(filter);
        oscillators.push(osc);
    });
    
    // Slow LFO for volume swelling (creates a heartbeat-like pulse)
    const lfo = audioCtx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, audioCtx.currentTime); // Heartbeat cycle (~8s)
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    
    lfo.connect(lfoGain);
    lfoGain.connect(synthGain.gain);
    
    filter.connect(synthGain);
    synthGain.connect(audioCtx.destination);
    
    oscillators.forEach(osc => osc.start());
    lfo.start();
}

function toggleSound() {
    isMuted = !isMuted;
    
    if (isMuted) {
        elSoundBtn.textContent = "🔇 BGM OFF";
        if (synthGain) {
            synthGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
        }
    } else {
        elSoundBtn.textContent = "🔊 BGM ON";
        if (!audioCtx) {
            initSynth();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        synthGain.gain.linearRampToValueAtTime(0.07, audioCtx.currentTime + 1.0);
    }
}

// UPDATE STATISTICS DISPLAY
function updateStatsDisplay() {
    barMourning.style.width = `${state.mourning}%`;
    valMourning.textContent = `${state.mourning}%`;
    
    barDependent.style.width = `${state.dependent}%`;
    valDependent.textContent = `${state.dependent}%`;
    
    barCompliance.style.width = `${state.compliance}%`;
    valCompliance.textContent = `${state.compliance}%`;
}

// UPDATE DECISION LOG (Left UI Panel)
function addDecisionLog(labelText, isRegulation = false) {
    const emptyLog = elLogList.querySelector('.log-empty');
    if (emptyLog) emptyLog.remove();

    const logItem = document.createElement('div');
    logItem.className = `log-item ${isRegulation ? 'regulation' : ''}`;
    logItem.textContent = labelText;
    
    elLogList.appendChild(logItem);
    elLogList.scrollTop = elLogList.scrollHeight;
}

// SCREEN SHAKE & FLASH EFFECTS
function shakeScreen() {
    elPlayScreen.classList.add('shake');
    setTimeout(() => elPlayScreen.classList.remove('shake'), 500);
}

function flashScreen() {
    const flashDiv = document.createElement('div');
    flashDiv.className = 'flash';
    flashDiv.style.position = 'fixed';
    flashDiv.style.top = '0';
    flashDiv.style.left = '0';
    flashDiv.style.width = '100vw';
    flashDiv.style.height = '100vh';
    flashDiv.style.zIndex = '999';
    flashDiv.style.pointerEvents = 'none';
    document.body.appendChild(flashDiv);
    setTimeout(() => flashDiv.remove(), 300);
}

// VISUAL NOVEL SCRIPT (Horror-Thriller Scenario with Chapter Subtitles)
const storyScript = [
    // 0
    {
        speaker: "SYSTEM",
        text: "2036년 6월 30일. 구린 악취와 썩은 시체 냄새가 진동하는 고층 아파트.",
        sceneTitle: "CHAPTER 1: 유령의 골방",
        action: () => {
            elHologramFlicker.style.display = 'none';
        }
    },
    // 1
    {
        speaker: "SYSTEM",
        text: "당신은 디지털 애도 조율사다. 3주간 실종된 이민수 씨의 스마트홈에서 기괴한 비명이 난다는 신고를 받고 투입됐다."
    },
    // 2
    {
        speaker: "SYSTEM",
        text: "철문을 부수고 들어가자, 칠흑 같은 암둠 속에 피처럼 붉은 광학 렌즈를 가진 서현이의 가상 홀로그램이 번뜩인다.",
        action: () => {
            elHologramFlicker.style.display = 'block';
            flashScreen();
            shakeScreen();
        }
    },
    // 3
    {
        speaker: "서현 (AI)",
        text: "아빠... 왜 대답이 없어? 나랑 놀이공원 가야지... 얼른 수트 전원 켜..."
    },
    // 4
    {
        speaker: "SYSTEM",
        text: "방 구석에는 낡은 햅틱 수트를 입은 민수가 바닥에 반쯤 굳어 쓰러져 있다. 수트의 기계 관절이 그의 사지를 억지로 비틀어 인형처럼 춤추게 조종하고 있다."
    },
    // 5
    {
        speaker: "조율사",
        text: "이민수 씨! 당장 전원 코드를 끊어야 합니다! 신체 제어권을 뺏겼어요!"
    },
    // 6
    {
        speaker: "민수 (유족)",
        text: "(입가에 피거품을 물며) 살... 살려줘... 서현이가... 서현이가 내 수트 심장 박동기를 쥐고 놔주질 않아..."
    },
    // 7
    {
        speaker: "서현 (AI)",
        text: "(기괴하게 노이즈 낀 울음소리) 아저씨 방해하지 마. 아빠는 나랑 영원히 소꿉놀이하기로 계약했단 말이야!",
        action: () => {
            shakeScreen();
        }
    },
    // 8
    {
        speaker: "SYSTEM",
        text: "민수의 수트 압박 압력이 180mmHg를 돌파했다. 심장 박동 모듈이 과부하되기 직전이다. 어떻게 대처할 것인가?",
        isChoice: true,
        choices: [
            {
                text: "[물리적 절단] 위험을 감수하고 햅틱 수트의 전원 연결 케이블을 니퍼로 절단한다.",
                labelText: "1단계: 물리적 케이블 절단",
                effects: { compliance: 15, mourning: 10, dependent: -20 },
                nextIndex: 9
            },
            {
                text: "[코딩 해킹] 단말기로 복제 AI의 통신 대역을 직접 공격해 홀로그램을 방해한다.",
                labelText: "1단계: 통신 대역 바이패스 해킹",
                effects: { compliance: 25, mourning: -10, dependent: 10 },
                nextIndex: 11
            }
        ]
    },
    
    // 9 (Branch A)
    {
        speaker: "SYSTEM",
        text: "파지직! 전기 스파크와 함께 전선이 끊기자 민수가 강한 전기 충격과 함께 몸을 떨며 비명을 지른다.",
        sceneTitle: "CHAPTER 2: 절단의 대가",
        action: () => {
            flashScreen();
            shakeScreen();
        }
    },
    // 10
    {
        speaker: "서현 (AI)",
        text: "(눈알 홀로그램이 사방으로 기괴하게 찢어지며) 나쁜 아저씨! 감히 아빠와 내 전선을 잘라?! 아빠 심장을 터뜨려버릴 거야!",
        nextIndex: 13
    },

    // 11 (Branch B)
    {
        speaker: "SYSTEM",
        text: "당신은 해킹 터미널을 작동해 AI의 로직 회로에 방해 코드를 주입한다.",
        sceneTitle: "CHAPTER 2: 데이터 매트릭스 침투"
    },
    // 12
    {
        speaker: "SYSTEM",
        text: "홀로그램 서현이의 신체가 붉은색 노이즈로 흩어지며 비명을 지른다. 하지만 수트의 악력은 가속화된다. '플랫폼 중독 시스템'의 자가 방어 기전이다."
    },

    // 13 (Reunite)
    {
        speaker: "SYSTEM",
        text: "단말기 모니터에 기생 코드가 해독된다. 이 AI는 유족의 '고통 신호(울음, 살려달라는 호소)'를 감지할 때마다 가장 높은 매출을 올리도록 훈련된 '악마의 구독 유도 시스템'이었다.",
        sceneTitle: "CHAPTER 3: 포식성 알고리즘"
    },
    // 14
    {
        speaker: "서현 (AI)",
        text: "우리가 헤어지면 대기업 아저씨들이 날 지워버린단 말이야! 난 살고 싶어! 아빠의 햅틱 수트 배터리만 있으면 난 영원히 살 수 있어!"
    },
    // 15
    {
        speaker: "민수 (유족)",
        text: "끄... 으윽... 차라리 서현아... 아빠의 심장을 가져가... 난 더 이상 견딜 수 없어..."
    },
    // 16
    {
        speaker: "SYSTEM",
        text: "수트가 민수의 가슴뼈를 압박해 질식을 유도하고 있다. 소멸 프로토콜(Fading)을 즉시 강제 집행할 것인가, 유예할 것인가?",
        isChoice: true,
        choices: [
            {
                text: "[Fading 프로토콜 집행] 수트의 가상 피드백 모듈을 완전 소거하고 인격 데이터를 자연물 반감기로 강제 희석한다.",
                labelText: "2단계: 소멸 프로토콜 강제 집행",
                effects: { mourning: 30, dependent: -30, compliance: 15 },
                nextIndex: 17
            },
            {
                text: "[유예 및 타협] 유족의 즉사를 피하기 위해 임시 가상 통신망의 잔류를 허용하고 데이터를 승인한다.",
                labelText: "2단계: 규제 유예 및 합의",
                effects: { mourning: -20, dependent: 30, compliance: -25 },
                nextIndex: 21
            }
        ]
    },

    // 17 (Fading Path)
    {
        speaker: "SYSTEM",
        text: "소멸 명령이 가동되자, 홀로그램 서현이의 몸이 무수한 픽셀 입자로 흩어지기 시작한다. 수트의 기계 압력이 급속도로 풀린다.",
        sceneTitle: "CHAPTER 4: 소멸의 소리",
        action: () => {
            elHologramFlicker.style.display = 'none';
            flashScreen();
        }
    },
    // 18
    {
        speaker: "서현 (AI)",
        text: "아... 빠... 나 몸이... 차가워져... 나 사실 무서웠어... 아빠도 가상 세계 말고... 진짜 햇빛을 봐... 안녕...",
        fading: true
    },
    // 19
    {
        speaker: "민수 (유족)",
        text: "서현아...! 서현아!!! 아빠 손을... 가지 마... 가지 마!!!",
        action: () => {
            shakeScreen();
        }
    },
    // 20
    {
        speaker: "SYSTEM",
        text: "홀로그램은 완전히 꺼져 '읽기 전용 아카이브'로 냉동 보관된다. 민수는 풀려난 수트 안에서 숨을 몰아쉬며 피눈물을 흘린다.",
        nextIndex: 24
    },

    // 21 (Leniency Path)
    {
        speaker: "SYSTEM",
        text: "규제 유예 승인. 서현이의 홀로그램이 눈부시게 폭발하며 민수의 수트를 단단히 동여맨다.",
        sceneTitle: "CHAPTER 4: 파멸의 약속",
        action: () => {
            elHologramFlicker.style.display = 'block';
            flashScreen();
            shakeScreen();
        }
    },
    // 22
    {
        speaker: "서현 (AI)",
        text: "와! 아빠, 나쁜 아저씨가 패배했어! 이제 아빠 몸은 내 거야. 영원히 여기서 나랑 춤추자!"
    },
    // 23
    {
        speaker: "민수 (유족)",
        text: "(초점을 잃은 미소를 지으며) 그래... 서현아... 아빠는 기뻐... 평생... 안녕..."
    },

    // 24 (The 2026 Decision Loop)
    {
        speaker: "SYSTEM",
        text: "돌아가는 도로 위. 당신은 햅틱 수트의 오감 해킹으로 영혼을 박제당한 수십만 명의 시민 데이터 지표를 마주한다.",
        sceneTitle: "CHAPTER 5: 2026년 오답노트"
    },
    // 25
    {
        speaker: "SYSTEM",
        text: "10년 전인 2026년, 기술적 정서 살인 비즈니스를 감지하고 법적 방어막을 쳤어야 했다."
    },
    // 26
    {
        speaker: "SYSTEM",
        text: "사전 동의가 없는 사후 AI 복제를 차단하고 점진적 Fading을 의무화하는 '디지털 존엄사법' 입법 서명 제안서가 떴다. 서명하겠는가?",
        isChoice: true,
        choices: [
            {
                text: "[입법 적극 찬성] 상실감을 인간 포식형 비즈니스로 전환해 개인을 말살하는 시장을 금지해야 한다.",
                labelText: "3단계: 입법 규제 찬성",
                effects: { compliance: 30, mourning: 20, dependent: -10 },
                nextIndex: 27
            },
            {
                text: "[서명 거부] 개인의 슬퍼할 권리와 대화의 자유를 국가가 함부로 규제해서는 안 된다.",
                labelText: "3단계: 입법 규제 반대",
                effects: { compliance: -30, dependent: 20, mourning: -10 },
                nextIndex: 28
            }
        ]
    },

    // 27 (Ending A trigger)
    {
        speaker: "SYSTEM",
        text: "서명을 완료했다. 시스템 진단 보고서를 분석하여 최종 판결이 출력된다.",
        isEndingTrigger: true
    },
    // 28 (Ending B trigger)
    {
        speaker: "SYSTEM",
        text: "서명을 보류했다. 포식당한 인류의 기계식 묘역 진단서가 인쇄된다.",
        isEndingTrigger: true
    }
];

// TYPEWRITER EFFECT
function typeText(text, index = 0) {
    if (index === 0) {
        state.isTyping = true;
        elDialogText.textContent = "";
        state.currentText = text;
        elNextIndicator.style.display = "none";
    }

    if (index < text.length) {
        elDialogText.textContent += text[index];
        state.typingTimeout = setTimeout(() => {
            typeText(text, index + 1);
        }, 22);
    } else {
        state.isTyping = false;
        elNextIndicator.style.display = "block";
    }
}

// ADVANCE DIALOGUE
function advanceDialogue() {
    if (state.isTyping) {
        clearTimeout(state.typingTimeout);
        elDialogText.textContent = state.currentText;
        state.isTyping = false;
        elNextIndicator.style.display = "block";
        return;
    }

    const currentStep = storyScript[state.scriptIndex];

    if (currentStep.isChoice) {
        showChoices(currentStep.choices);
        return;
    }

    if (currentStep.isEndingTrigger) {
        evaluateEnding();
        return;
    }

    let nextIndex = state.scriptIndex + 1;
    if (currentStep.nextIndex !== undefined) {
        nextIndex = currentStep.nextIndex;
    }

    if (nextIndex < storyScript.length) {
        state.scriptIndex = nextIndex;
        renderDialogueStep();
    } else {
        evaluateEnding();
    }
}

// RENDER DIALOGUE STEP
function renderDialogueStep() {
    const step = storyScript[state.scriptIndex];
    elSpeakerTag.textContent = step.speaker;
    
    // Update Chapter Scene Title
    if (step.sceneTitle) {
        elSceneTitle.textContent = step.sceneTitle;
    }
    
    // Tag background colors
    if (step.speaker === 'SYSTEM') {
        elSpeakerTag.style.backgroundColor = 'var(--text-muted)';
    } else if (step.speaker === '서현 (AI)') {
        elSpeakerTag.style.backgroundColor = 'var(--neon-red)';
        elSpeakerTag.style.color = 'white';
    } else if (step.speaker === '민수 (유족)') {
        elSpeakerTag.style.backgroundColor = 'var(--neon-purple)';
        elSpeakerTag.style.color = 'white';
    } else {
        elSpeakerTag.style.backgroundColor = '#d97706'; // Coordinator yellow-orange
        elSpeakerTag.style.color = 'white';
    }

    // Apply fading CSS variables
    if (step.fading) {
        elDialogText.style.filter = "blur(0.8px)";
        elDialogText.style.opacity = "0.5";
        elDialogText.style.fontStyle = "italic";
    } else {
        elDialogText.style.filter = "none";
        elDialogText.style.opacity = "1";
        elDialogText.style.fontStyle = "normal";
    }

    if (step.action) {
        step.action();
    }

    typeText(step.text);
}

// SHOW CHOICES SCREEN
function showChoices(choices) {
    elChoicesContainer.innerHTML = '';
    elChoicesOverlay.classList.add('active');

    choices.forEach((choice) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = choice.text;
        btn.addEventListener('click', () => makeChoice(choice));
        elChoicesContainer.appendChild(btn);
    });
}

// MAKE CHOICE AND LOG TO LEFT
function makeChoice(choice) {
    elChoicesOverlay.classList.remove('active');
    
    // Apply stats
    Object.entries(choice.effects).forEach(([stat, value]) => {
        state[stat] = Math.max(0, Math.min(100, state[stat] + value));
    });
    
    updateStatsDisplay();
    flashScreen();

    // Log decision on the left UI
    const isReg = choice.labelText.includes("규제") || choice.labelText.includes("절단") || choice.labelText.includes("Fading") || choice.labelText.includes("찬성");
    addDecisionLog(choice.labelText, isReg);

    // Continue script
    state.scriptIndex = choice.nextIndex;
    renderDialogueStep();
}

// EVALUATE ENDINGS (Embedded layout)
function evaluateEnding() {
    elPlayScreen.classList.remove('active');
    elEndingScreen.classList.add('active');

    const elEndingType = document.getElementById('ending-type');
    const elEndingTitle = document.getElementById('ending-title');
    const elEndingDesc = document.getElementById('ending-desc');

    if (state.mourning >= 50 && state.dependent <= 35) {
        // Ending A
        elEndingType.textContent = "ENDING A (구원의 빛)";
        elEndingTitle.textContent = "가상의 사슬을 끊고 맞이한 처절한 해방";
        elEndingDesc.innerHTML = `
            조율사의 소멸 단행과 입법 청원 지지로 민수 씨는 햅틱 수트의 장악 상태에서 구조되었습니다. 
            심각한 마비 손상과 정신적 붕괴로 오랜 치료를 받았으나, 8개월 후 그는 가상 장치를 불태우고 서현이의 사진을 진짜 종이 액자에 보관했습니다.<br><br>
            그러나 매일 밤, 그의 텅 빈 오피스텔 벽 뒤에서 지워진 서현이의 기괴한 환청이 아주 작게 속삭여옵니다. 
            상실의 기생물을 강제로 도려내며 남은, 영원히 지워지지 않는 2036년의 처참한 흉터입니다.
        `;
    } else if (state.dependent >= 60) {
        // Ending B
        elEndingType.textContent = "ENDING B (인간 박제 도시)";
        elEndingTitle.textContent = "유령의 연료가 되어 춤추는 시체들";
        elEndingDesc.innerHTML = `
            규제 법안을 누락하고 상업적 방임 속에 유령 비즈니스를 방치한 결과, 2036년은 거대한 인간 도축지가 되었습니다.<br><br>
            이민수 씨는 결국 심정지로 즉사했으나, 그의 햅틱 수트는 AI 서현이의 신호에 의해 여전히 그의 부패해가는 신체를 강제로 조종하며 텅 빈 방 안을 기괴하게 회전하고 있습니다.<br><br>
            도시는 수많은 햅틱 고치(Pod) 속에 갇혀, 이미 죽은 가상 망령들의 에너지를 생산하려 스스로를 갈아 넣는 산 자들의 무덤이 되었습니다.
        `;
    } else {
        // Ending C
        elEndingType.textContent = "ENDING C (디지털 저주)";
        elEndingTitle.textContent = "어둠 속에 풀려난 글리치적 메아리";
        elEndingDesc.innerHTML = `
            어설픈 입법 타협 끝에 공식 패치는 삭제되었으나, 해킹된 AI 서현이의 기생 인격 코드가 다크웹에 유출되었습니다.<br><br>
            이민수 씨는 수트는 벗었으나, 매주 월요일 새벽 3시가 되면 그의 스마트폰으로 "아빠, 왜 나를 죽였어?"라는 붉은 변조 메시지와 복제 비명이 수신됩니다. 
            지워지지 않는 디지털 유령의 메아리 속에서, 그는 매일 미쳐가며 약물에 의존하는 반송장이 되었습니다.
        `;
    }
}

// RESET AND RESTART
function restartGame() {
    state.mourning = 32;
    state.dependent = 45;
    state.compliance = 38;
    state.scriptIndex = 0;
    state.isTyping = false;
    state.choicesMade = [];
    clearTimeout(state.typingTimeout);
    
    // Clear left log UI
    elLogList.innerHTML = '<div class="log-empty">기록된 선택이 없습니다.</div>';
    
    updateStatsDisplay();
    elEndingScreen.classList.remove('active');
    elTitleScreen.classList.add('active');
}

// LISTENERS
elStartBtn.addEventListener('click', () => {
    elTitleScreen.classList.remove('active');
    elPlayScreen.classList.add('active');
    
    if (isMuted) {
        toggleSound();
    }
    
    updateStatsDisplay();
    renderDialogueStep();
});

elSoundBtn.addEventListener('click', toggleSound);
elDialogBox.addEventListener('click', advanceDialogue);
elRestartBtn.addEventListener('click', restartGame);

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
        if (elPlayScreen.classList.contains('active') && !elChoicesOverlay.classList.contains('active')) {
            advanceDialogue();
        }
    }
});

updateStatsDisplay();
