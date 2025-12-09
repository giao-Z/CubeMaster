
import { CubeColor, Face, CubeState, CubeSize, Language, LearnTopic } from './types';

export const FACE_ORDER = [Face.F, Face.R, Face.B, Face.L, Face.U, Face.D];

export const FACE_NAMES: Record<Face, string> = {
  [Face.F]: 'Front (Green)',
  [Face.R]: 'Right (Red)',
  [Face.B]: 'Back (Blue)',
  [Face.L]: 'Left (Orange)',
  [Face.U]: 'Up (White)',
  [Face.D]: 'Down (Yellow)',
};

export const FACE_CENTER_COLORS: Record<Face, CubeColor> = {
  [Face.F]: 'green',
  [Face.R]: 'red',
  [Face.B]: 'blue',
  [Face.L]: 'orange',
  [Face.U]: 'white',
  [Face.D]: 'yellow',
};

export const COLOR_HEX: Record<CubeColor, string> = {
  white: '#FFFFFF',
  yellow: '#FFD500',
  green: '#009E60',
  blue: '#0051BA',
  red: '#C41E3A',
  orange: '#FF5800',
  gray: '#334155',
};

export const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
];

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    appTitle: 'CubeMaster Pro',
    subTitle: 'The Ultimate Intelligent Cube System',
    selectOrder: 'Select Cube Order',
    aiSolver: 'AI Solver',
    aiSolverDesc: 'Scan & Solve your cube',
    freePlay: 'Free Play',
    freePlayDesc: 'Virtual Cube',
    learn: 'Learn',
    learnDesc: 'Tutorials',
    scan: 'Scan',
    verify: 'Verify',
    solve: 'Solve Cube',
    calculating: 'Calculating Solution...',
    solved: 'Solved!',
    backHome: 'Back to Home',
    step: 'Step',
    nextMove: 'Next Move',
    rescan: 'Rescan',
    confirm: 'Confirm Face',
    retake: 'Retake',
    gestureControl: 'Gesture Control',
    touchControl: 'Touch Control',
    gestureTip: 'Wave hand: Up/Down/Left/Right',
    touchTip: 'Tap buttons to rotate',
    reset: 'Reset',
    mode: 'Mode',
    gestureTutorialTitle: 'Gesture Control Guide',
    gestureTutorialDesc: 'Control the cube with hand movements',
    gotIt: 'Got it!',
    howItWorks: 'How it works',
    howItWorksDesc: 'The camera tracks the optical flow of your movement. Ensure you are in a well-lit environment and move your hand clearly in front of the camera.',
    controlsGuide: 'Controls Guide',
    controlsDesc: 'Standard Notation',
  },
  zh: {
    appTitle: '魔方大师 Pro',
    subTitle: '终极智能魔方系统',
    selectOrder: '选择魔方阶数',
    aiSolver: 'AI 求解器',
    aiSolverDesc: '扫描并还原您的魔方',
    freePlay: '自由模式',
    freePlayDesc: '虚拟魔方',
    learn: '学习中心',
    learnDesc: '教程与技巧',
    scan: '扫描',
    verify: '验证',
    solve: '开始还原',
    calculating: '正在计算解法...',
    solved: '已还原！',
    backHome: '返回首页',
    step: '步骤',
    nextMove: '下一步',
    rescan: '重新扫描',
    confirm: '确认',
    retake: '重拍',
    gestureControl: '手势控制',
    touchControl: '触屏控制',
    gestureTip: '挥手方向：上/下/左/右',
    touchTip: '点击按钮旋转',
    reset: '重置',
    mode: '模式',
    gestureTutorialTitle: '手势控制指南',
    gestureTutorialDesc: '通过手势控制魔方旋转',
    gotIt: '明白了！',
    howItWorks: '工作原理',
    howItWorksDesc: '摄像头会追踪您手部运动的光流变化。请确保环境光线充足，并在摄像头前清晰地挥动手部。',
    controlsGuide: '操作指南',
    controlsDesc: '标准魔方符号',
  },
  es: {
    appTitle: 'CubeMaster Pro',
    subTitle: 'Sistema Inteligente de Cubos',
    selectOrder: 'Seleccionar Orden',
    aiSolver: 'Solucionador IA',
    aiSolverDesc: 'Escanear y resolver',
    freePlay: 'Juego Libre',
    freePlayDesc: 'Cubo Virtual',
    learn: 'Aprender',
    learnDesc: 'Tutoriales',
    scan: 'Escanear',
    verify: 'Verificar',
    solve: 'Resolver',
    calculating: 'Calculando...',
    solved: '¡Resuelto!',
    backHome: 'Volver al Inicio',
    step: 'Paso',
    nextMove: 'Siguiente',
    rescan: 'Re-escanear',
    confirm: 'Confirmar',
    retake: 'Retomar',
    gestureControl: 'Control Gestual',
    touchControl: 'Control Táctil',
    gestureTip: 'Mover mano: Arriba/Abajo...',
    touchTip: 'Tocar botones para rotar',
    reset: 'Reiniciar',
    mode: 'Modo',
    gestureTutorialTitle: 'Guía de Gestos',
    gestureTutorialDesc: 'Controla el cubo con tu mano',
    gotIt: '¡Entendido!',
    howItWorks: 'Cómo funciona',
    howItWorksDesc: 'La cámara rastrea el flujo óptico de tu movimiento. Asegúrate de tener buena iluminación.',
    controlsGuide: 'Guía de Controles',
    controlsDesc: 'Notación Estándar',
  },
  fr: {
    appTitle: 'CubeMaster Pro',
    subTitle: 'Système Intelligent de Cube',
    selectOrder: 'Choisir la Taille',
    aiSolver: 'Résolveur IA',
    aiSolverDesc: 'Scanner et résoudre',
    freePlay: 'Jeu Libre',
    freePlayDesc: 'Cube Virtuel',
    learn: 'Apprendre',
    learnDesc: 'Tutoriels',
    scan: 'Scanner',
    verify: 'Vérifier',
    solve: 'Résoudre',
    calculating: 'Calcul en cours...',
    solved: 'Résolu !',
    backHome: 'Retour Accueil',
    step: 'Étape',
    nextMove: 'Suivant',
    rescan: 'Rescanner',
    confirm: 'Confirmer',
    retake: 'Reprendre',
    gestureControl: 'Contrôle Gestuel',
    touchControl: 'Contrôle Tactile',
    gestureTip: 'Agiter la main: Haut/Bas...',
    touchTip: 'Appuyez pour tourner',
    reset: 'Réinitialiser',
    mode: 'Mode',
    gestureTutorialTitle: 'Guide Gestuel',
    gestureTutorialDesc: 'Contrôlez le cube avec la main',
    gotIt: 'Compris !',
    howItWorks: 'Comment ça marche',
    howItWorksDesc: 'La caméra suit le flux optique. Assurez-vous d\'être dans un environnement bien éclairé.',
    controlsGuide: 'Guide des Contrôles',
    controlsDesc: 'Notation Standard',
  },
  ru: {
    appTitle: 'CubeMaster Pro',
    subTitle: 'Умная система кубика',
    selectOrder: 'Выберите размер',
    aiSolver: 'ИИ Решатель',
    aiSolverDesc: 'Сканируй и реши',
    freePlay: 'Свободная игра',
    freePlayDesc: 'Виртуальный куб',
    learn: 'Обучение',
    learnDesc: 'Уроки',
    scan: 'Сканировать',
    verify: 'Проверка',
    solve: 'Решить',
    calculating: 'Вычисление...',
    solved: 'Решено!',
    backHome: 'На главную',
    step: 'Шаг',
    nextMove: 'Далее',
    rescan: 'Переснять',
    confirm: 'Подтвердить',
    retake: 'Переснять',
    gestureControl: 'Жесты',
    touchControl: 'Сенсор',
    gestureTip: 'Взмах рукой: Вверх/Вниз...',
    touchTip: 'Нажмите для вращения',
    reset: 'Сброс',
    mode: 'Режим',
    gestureTutorialTitle: 'Гид по жестам',
    gestureTutorialDesc: 'Управление рукой',
    gotIt: 'Понятно!',
    howItWorks: 'Как это работает',
    howItWorksDesc: 'Камера отслеживает движение. Обеспечьте хорошее освещение.',
    controlsGuide: 'Управление',
    controlsDesc: 'Стандартная нотация',
  },
  ar: {
    appTitle: 'CubeMaster Pro',
    subTitle: 'نظام المكعب الذكي',
    selectOrder: 'اختر حجم المكعب',
    aiSolver: 'حلال الذكاء الاصطناعي',
    aiSolverDesc: 'مسح وحل المكعب',
    freePlay: 'لعب حر',
    freePlayDesc: 'مكعب افتراضي',
    learn: 'تعلم',
    learnDesc: 'دروس',
    scan: 'مسح',
    verify: 'تحقق',
    solve: 'حل المكعب',
    calculating: 'جاري الحساب...',
    solved: 'تم الحل!',
    backHome: 'عودة للرئيسية',
    step: 'خطوة',
    nextMove: 'التالي',
    rescan: 'إعادة المسح',
    confirm: 'تأكيد',
    retake: 'إعادة',
    gestureControl: 'التحكم بالإيماءات',
    touchControl: 'التحكم باللمس',
    gestureTip: 'حرك يدك: فوق/تحت/يسار/يمين',
    touchTip: 'اضغط للتدوير',
    reset: 'إعادة تعيين',
    mode: 'الوضع',
    gestureTutorialTitle: 'دليل الإيماءات',
    gestureTutorialDesc: 'تحكم في المكعب بحركة اليد',
    gotIt: 'فهمت!',
    howItWorks: 'كيف يعمل',
    howItWorksDesc: 'تتتبع الكاميرا حركة يدك. تأكد من وجود إضاءة جيدة.',
    controlsGuide: 'دليل التحكم',
    controlsDesc: 'الرموز القياسية',
  },
};

export const MOVE_DESCRIPTIONS_DATA: Record<Language, Record<string, string>> = {
  en: {
    'U': 'Top Layer ➜ Left (Clockwise)',
    "U'": 'Top Layer ➜ Right (Counter-CW)',
    'D': 'Bottom Layer ➜ Right (Clockwise)',
    "D'": 'Bottom Layer ➜ Left (Counter-CW)',
    'R': 'Right Side ➜ UP',
    "R'": 'Right Side ➜ DOWN',
    'L': 'Left Side ➜ DOWN',
    "L'": 'Left Side ➜ UP',
    'F': 'Front Face ➜ Clockwise',
    "F'": 'Front Face ➜ Counter-CW',
    'B': 'Back Face ➜ Clockwise',
    "B'": 'Back Face ➜ Counter-CW',
  },
  zh: {
    'U': '顶层 ➜ 向左 (顺时针)',
    "U'": '顶层 ➜ 向右 (逆时针)',
    'D': '底层 ➜ 向右 (顺时针)',
    "D'": '底层 ➜ 向左 (逆时针)',
    'R': '右侧 ➜ 向上',
    "R'": '右侧 ➜ 向下',
    'L': '左侧 ➜ 向下',
    "L'": '左侧 ➜ 向上',
    'F': '前面 ➜ 顺时针',
    "F'": '前面 ➜ 逆时针',
    'B': '后面 ➜ 顺时针',
    "B'": '后面 ➜ 逆时针',
  },
  es: {
    'U': 'Arriba ➜ Izquierda (Horario)',
    "U'": 'Arriba ➜ Derecha (Anti-hor)',
    'D': 'Abajo ➜ Derecha (Horario)',
    "D'": 'Abajo ➜ Izquierda (Anti-hor)',
    'R': 'Derecha ➜ ARRIBA',
    "R'": 'Derecha ➜ ABAJO',
    'L': 'Izquierda ➜ ABAJO',
    "L'": 'Izquierda ➜ ARRIBA',
    'F': 'Frente ➜ Horario',
    "F'": 'Frente ➜ Anti-horario',
    'B': 'Atrás ➜ Horario',
    "B'": 'Atrás ➜ Anti-horario',
  },
  fr: {
    'U': 'Haut ➜ Gauche (Horaire)',
    "U'": 'Haut ➜ Droite (Anti-Hor)',
    'D': 'Bas ➜ Droite (Horaire)',
    "D'": 'Bas ➜ Gauche (Anti-Hor)',
    'R': 'Droite ➜ HAUT',
    "R'": 'Droite ➜ BAS',
    'L': 'Gauche ➜ BAS',
    "L'": 'Gauche ➜ HAUT',
    'F': 'Face ➜ Horaire',
    "F'": 'Face ➜ Anti-Horaire',
    'B': 'Arr. ➜ Horaire',
    "B'": 'Arr. ➜ Anti-Horaire',
  },
  ru: {
    'U': 'Верх ➜ Влево',
    "U'": 'Верх ➜ Вправо',
    'D': 'Низ ➜ Вправо',
    "D'": 'Низ ➜ Влево',
    'R': 'Право ➜ ВВЕРХ',
    "R'": 'Право ➜ ВНИЗ',
    'L': 'Лево ➜ ВНИЗ',
    "L'": 'Лево ➜ ВВЕРХ',
    'F': 'Фасад ➜ По час.',
    "F'": 'Фасад ➜ Против',
    'B': 'Тыл ➜ По час.',
    "B'": 'Тыл ➜ Против',
  },
  ar: {
    'U': 'فوق ➜ يسار',
    "U'": 'فوق ➜ يمين',
    'D': 'تحت ➜ يمين',
    "D'": 'تحت ➜ يسار',
    'R': 'يمين ➜ فوق',
    "R'": 'يمين ➜ تحت',
    'L': 'يسار ➜ تحت',
    "L'": 'يسار ➜ فوق',
    'F': 'أمام ➜ مع الساعة',
    "F'": 'أمام ➜ عكس الساعة',
    'B': 'خلف ➜ مع الساعة',
    "B'": 'خلف ➜ عكس الساعة',
  }
};

const BASE_LEARN_TOPICS_EN: LearnTopic[] = [
  { 
    id: '1', 
    title: 'Notation Basics', 
    description: 'Master the language of the Cube (R, U, F)', 
    level: 'Beginner', 
    duration: '5 min',
    sections: [
      {
        title: 'The 6 Faces',
        content: 'Hold the cube with White on TOP and Green facing YOU. The faces are: Up (U), Down (D), Left (L), Right (R), Front (F), Back (B).'
      },
      {
        title: 'Clockwise vs Counter-Clockwise',
        content: 'A letter by itself (e.g., "R") means turn that face 90 degrees Clockwise (as if you were looking directly at that face). An apostrophe (e.g., "R\'") means turn it Counter-Clockwise (Prime).'
      },
      {
        title: 'Double Turns',
        content: 'A number 2 (e.g., "U2") means turn that face 180 degrees (halfway around). Direction doesn\'t matter for double turns.'
      }
    ]
  },
  { 
    id: '2', 
    title: 'Beginner\'s Guide (Layer-by-Layer)', 
    description: 'The official 7-step method to solve any 3x3 cube', 
    level: 'Beginner', 
    duration: '30 min',
    sections: [
      {
        title: 'Step 1: The White Daisy',
        content: 'Goal: Place 4 White Edge pieces around the Yellow center. \n\nStrategy: Look for white edges. Rotate faces to bring them to the top layer surrounding the yellow center. No algorithms needed, just intuition.'
      },
      {
        title: 'Step 2: The White Cross',
        content: 'Goal: Move the white edges to the bottom to form a White Cross. \n\nStrategy: 1. Look at a petal of the Daisy. 2. Match its SIDE color with the center piece of that side. 3. Rotate that face 180° (F2) to bring the white edge down.'
      },
      {
        title: 'Step 3: Solve White Corners',
        content: 'Goal: Complete the entire bottom White face. \n\nStrategy: Find a white corner in the top layer. Move it directly ABOVE where it needs to go. Hold the cube so the target slot is at the bottom-right. Repeat this algorithm until the corner drops in correctly:',
        algorithm: "R U R' U'"
      },
      {
        title: 'Step 4: Middle Layer Edges',
        content: 'Goal: Solve the second layer. \n\nStrategy: Find an edge on top with NO yellow. Match its front color to a center to make a generic T-shape. \nIf it needs to go to the RIGHT gap, use the Right Algorithm. If LEFT, use Left Algorithm.',
        algorithm: "Right: U R U' R' U' F' U F \nLeft: U' L' U L U F U' F'"
      },
      {
        title: 'Step 5: Yellow Cross',
        content: 'Goal: Make a yellow cross on the top face. \n\nStrategy: Look at the yellow pattern. \n1. Dot: Execute algo once. \n2. "L" Shape: Put it in top-left corner, execute algo. \n3. Line: Horizontal, execute algo.',
        algorithm: "F R U R' U' F'"
      },
      {
        title: 'Step 6: Align Yellow Cross',
        content: 'Goal: Match the yellow edges with side centers. \n\nStrategy: Rotate top (U) until 2 edges match. Hold one matched edge at the BACK and one on the RIGHT (or opposite if only 2 match opposite). Perform Sune Algorithm:',
        algorithm: "R U R' U R U2 R'"
      },
      {
        title: 'Step 7: Position Yellow Corners',
        content: 'Goal: Put corners in the right spot (orientation doesn\'t matter yet). \n\nStrategy: Find a corner that is in the right place (colors match the 3 centers near it). Hold it at Front-Right-Top. Perform Niklas Algorithm:',
        algorithm: "U R U' L' U R' U' L"
      },
      {
        title: 'Step 8: Orient Yellow Corners',
        content: 'Goal: Twist corners to finish. \n\nStrategy: 1. Hold cube with YELLOW Face FRONT. 2. Pick an unsolved corner at Top-Right. 3. Repeat (R\' D\' R D) until yellow faces Front. 4. CRITICAL: Rotate ONLY the Front face (F) to bring the next unsolved corner to Top-Right. Repeat.',
        algorithm: "R' D' R D"
      }
    ]
  },
  { 
    id: '3', 
    title: 'Finger Tricks', 
    description: 'Speed up your solving with proper finger placement', 
    level: 'Intermediate', 
    duration: '15 min', 
    sections: [
      {
        title: 'The "Trigger" (R/R\')',
        content: 'Instead of grabbing the whole right side with your hand, hold the cube with your thumb on Front and fingers on Back. Use your WRIST to rotate the right side up or down.',
        visual: 'swipe-up'
      },
      {
        title: 'Index Push (U)',
        content: 'To turn the Top layer (U), hold the cube in both hands. Use your RIGHT Index finger to PUSH the top-back-right corner towards the left. This is much faster than regripping.',
        visual: 'swipe-left'
      },
      {
        title: 'Index Pull (U\')',
        content: 'To turn the Top layer counter-clockwise (U\'), use your LEFT Index finger to PUSH the top-back-left corner towards the right.',
        visual: 'swipe-right'
      },
      {
        title: 'Thumb Push (F\')',
        content: 'For Front turns, you can often use your RIGHT Thumb to push the bottom-right corner upwards to simulate an F\' move.',
        visual: 'swipe-down'
      }
    ]
  },
  { 
    id: '4', 
    title: 'CFOP Overview', 
    description: 'Introduction to the pro speedcubing method', 
    level: 'Advanced', 
    duration: '45 min', 
    sections: [
      {
        title: 'Phase 1: Cross (C)',
        content: 'Similar to the beginner method, but solve the Cross directly on the BOTTOM (D face) without making a daisy first. Advanced solvers plan the entire cross during inspection (15s).'
      },
      {
        title: 'Phase 2: F2L (First 2 Layers)',
        content: 'Instead of solving corners and then edges separately, you pair a Corner and an Edge in the top layer, then insert them together into their slot. This solves the first two layers simultaneously.',
        algorithm: "Common Insert: R U' R'"
      },
      {
        title: 'Phase 3: OLL (Orientation)',
        content: 'Orient Last Layer. Use 1 of 57 algorithms to make the entire top face Yellow in one step, regardless of permutation.',
        algorithm: "Example (Sune): R U R' U R U2 R'"
      },
      {
        title: 'Phase 4: PLL (Permutation)',
        content: 'Permute Last Layer. Use 1 of 21 algorithms to move the yellow pieces to their correct solved locations.',
        algorithm: "Example (T-Perm): R U R' U' R' F R2 U' R' U' R U R' F'"
      }
    ]
  },
];

const BASE_LEARN_TOPICS_ZH: LearnTopic[] = [
  { 
    id: '1', 
    title: '基础符号入门', 
    description: '掌握魔方的语言 (R, U, F)', 
    level: 'Beginner', 
    duration: '5 分钟',
    sections: [
      {
        title: '六个面',
        content: '手持魔方，白色朝上，绿色朝自己。六个面分别是：上(U)、下(D)、左(L)、右(R)、前(F)、后(B)。'
      },
      {
        title: '顺时针与逆时针',
        content: '单独的字母（如 "R"）表示顺时针旋转该面90度（想象你正对着该面看）。带撇号（如 "R\'"）表示逆时针旋转。'
      },
      {
        title: '旋转180度',
        content: '数字2（如 "U2"）表示旋转该面180度（转两下）。方向不影响结果。'
      }
    ]
  },
  { 
    id: '2', 
    title: '新手还原指南 (层先法)', 
    description: '官方标准的七步还原法，适用于所有3x3', 
    level: 'Beginner', 
    duration: '30 分钟',
    sections: [
      { title: '第一步：小雏菊 (Daisy)', content: '目标：将4个白色棱块移动到顶层，围绕黄色中心。\n策略：寻找白色棱块，通过旋转侧面将其送入顶层。这一步依靠直觉，不需要公式。' },
      { title: '第二步：白十字 (White Cross)', content: '目标：将白色棱块归位到底层。\n策略：1. 看雏菊瓣的侧面颜色。2. 转动顶层使其与侧面中心块对齐。3. 旋转该面180度(F2)将其转到底部。' },
      { title: '第三步：还原底层角块', content: '目标：完成白色底面。\n策略：在顶层找到含有白色的角块，将其转到目标位置的正上方。使用右手公式重复，直到角块正确归位：', algorithm: "R U R' U'" },
      { title: '第四步：中层棱块', content: '目标：还原第二层。\n策略：在顶层找不含黄色的棱块。使其侧面颜色形成"倒T字"。\n如果要向右归位，用右手公式；向左归位，用左手公式。', algorithm: "向右: U R U' R' U' F' U F \n向左: U' L' U L U F U' F'" },
      { title: '第五步：顶层黄十字', content: '目标：顶面出现黄色十字。\n策略：观察黄色图案。\n1. 点：做一次公式。\n2. L形（小拐弯）：放在左上角，做公式。\n3. 一字线：水平放置，做公式。', algorithm: "F R U R' U' F'" },
      { title: '第六步：对齐顶层十字', content: '目标：使黄色棱块侧面与中心对齐。\n策略：转动顶层直到有两个棱块对其。一个放在后，一个放在右。做"小鱼公式"：', algorithm: "R U R' U R U2 R'" },
      { title: '第七步：顶层角块归位', content: '目标：将角块放到正确的位置（方向可以不对）。\n策略：找一个位置正确的角块（颜色匹配周围中心）。把它放在"前-右-上"位置。做公式：', algorithm: "U R U' L' U R' U' L" },
      { title: '第八步：顶层角块翻色', content: '目标：调整角块朝向，完成魔方。\n策略：1. 黄色面朝前(F)。2. 将未还原的角块放在右上角。3. 重复 (R\' D\' R D) 直到黄色朝前。\n4. 关键：只转动前层(F)，把下一个坏角块转到右上角，继续做公式。', algorithm: "R' D' R D" }
    ]
  },
  { 
    id: '3', 
    title: '手指技巧', 
    description: '学习正确的手法，提升速度', 
    level: 'Intermediate', 
    duration: '15 分钟', 
    sections: [
      {
        title: '扳机手法 (Trigger)',
        content: '不要用整个手掌抓右层，而是拇指在前，手指在后。用手腕力量转动右层向上或向下。',
        visual: 'swipe-up'
      },
      {
        title: '食指推 (U)',
        content: '转动顶层(U)时，双手持魔方。用右食指从后往前"推"右后角的棱块。这比换手抓取要快得多。',
        visual: 'swipe-left'
      },
      {
        title: '左食指推 (U\')',
        content: '转动顶层逆时针(U\')时，用左食指从后往前"推"左后角的棱块。',
        visual: 'swipe-right'
      },
      {
        title: '拇指推 (F\')',
        content: '做前层逆时针(F\')时，可以用右拇指向上推右下角的棱块。',
        visual: 'swipe-down'
      }
    ]
  },
  { 
    id: '4', 
    title: 'CFOP 简介', 
    description: '专业速拧解法概览', 
    level: 'Advanced', 
    duration: '45 分钟', 
    sections: [
      {
        title: '阶段 1: 底层十字 (Cross)',
        content: '类似层先法，但直接在底部(D面)还原十字，不经过小雏菊阶段。高手会在观察期(15秒)规划好整个十字的步数。'
      },
      {
        title: '阶段 2: 前两层 (F2L)',
        content: '不再分步还原角块和棱块。我们在顶层将一个角块和一个棱块配对，然后一起插入槽位。这能同时还原前两层。',
        algorithm: "常用插入: R U' R'"
      },
      {
        title: '阶段 3: 顶层定向 (OLL)',
        content: 'Orientation Last Layer. 使用57个公式中的一个，一步将顶面全部变成黄色（不管侧面颜色）。',
        algorithm: "示例 (小鱼): R U R' U R U2 R'"
      },
      {
        title: '阶段 4: 顶层归位 (PLL)',
        content: 'Permutation Last Layer. 使用21个公式中的一个，将顶层所有块移动到正确位置，完成魔方。',
        algorithm: "示例 (T字爆): R U R' U' R' F R2 U' R' U' R U R' F'"
      }
    ]
  },
];

export const LEARN_TOPICS_DATA: Record<Language, LearnTopic[]> = {
  en: BASE_LEARN_TOPICS_EN,
  zh: BASE_LEARN_TOPICS_ZH,
  es: BASE_LEARN_TOPICS_EN, 
  fr: BASE_LEARN_TOPICS_EN,
  ru: BASE_LEARN_TOPICS_EN,
  ar: BASE_LEARN_TOPICS_EN,
};

export const getInitialCubeState = (size: CubeSize): CubeState => {
  const count = size * size;
  return {
    [Face.U]: Array(count).fill('white'),
    [Face.D]: Array(count).fill('yellow'),
    [Face.F]: Array(count).fill('green'),
    [Face.B]: Array(count).fill('blue'),
    [Face.L]: Array(count).fill('orange'),
    [Face.R]: Array(count).fill('red'),
  };
};
