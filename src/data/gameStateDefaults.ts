import { GameSettings, PlayerProfile, Achievement } from "../types";

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_spot",
    title: "Первая находка",
    titleEn: "First Discovery",
    description: "Найдите самое первое отличие среди миров.",
    descriptionEn: "Find your very first difference.",
    unlocked: false,
    icon: "Eye",
    progress: 0,
    maxProgress: 1,
  },
  {
    id: "scout_level",
    title: "Начало пути",
    titleEn: "Beginner Detective",
    description: "Успешно завершите любой уровень.",
    descriptionEn: "Complete any level successfully.",
    unlocked: false,
    icon: "Award",
    progress: 0,
    maxProgress: 1,
  },
  {
    id: "perfect_score",
    title: "Безупречный сыщик",
    titleEn: "Flawless Mind",
    description: "Найдите все 6 отличий на одном уровне без единой ошибки или подсказки.",
    descriptionEn: "Spot all 6 differences in a single level with 0 mistakes and 0 hints.",
    unlocked: false,
    icon: "CheckCircle",
    progress: 0,
    maxProgress: 1,
  },
  {
    id: "all_worlds",
    title: "Покоритель Миров",
    titleEn: "World Master",
    description: "Пройдите все 5 доступных миров.",
    descriptionEn: "Complete all 5 distinct worlds.",
    unlocked: false,
    icon: "Globe",
    progress: 0,
    maxProgress: 5,
  },
  {
    id: "combo_king",
    title: "Комбо Король",
    titleEn: "Combo King",
    description: "Наберите множитель комбо х5 подряд без промахов.",
    descriptionEn: "Reach a combo streak of x5 without any miss-clicks.",
    unlocked: false,
    icon: "Zap",
    progress: 0,
    maxProgress: 5,
  },
  {
    id: "speed_runner",
    title: "Быстрее ветра",
    titleEn: "Lightning Eye",
    description: "Завершите уровень быстрее чем за 45 секунд.",
    descriptionEn: "Complete any level in less than 45 seconds.",
    unlocked: false,
    icon: "ZapOff",
    progress: 0,
    maxProgress: 1,
  }
];

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  showTimer: true,
  magnifierEnabled: false,
  language: "ru",
  vibrationEnabled: true,
};

export const DEFAULT_PROFILE: PlayerProfile = {
  levelsProgress: {},
  hintsCount: 3,
  totalScore: 0,
  comboCount: 1,
  maxCombo: 1,
  lastActiveLevelId: 1,
  achievements: DEFAULT_ACHIEVEMENTS,
};
