/* CommCard V3 - AAC Core Words (Kids) */
/* Basic core vocabulary organised using Fitzgerald-Key inspired colour coding.
   Each word has a symbol (emoji) to support pre- and emerging readers. */

const AAC_CATEGORIES = [
  {
    id: 'basics',
    label: 'Basics',
    emoji: '⭐',
    color: '#E86A92',      // pink - social
    colorLight: '#FDEBF1',
    colorDark: '#B03A63',
    words: [
      { word: 'yes',       symbol: '✅' },
      { word: 'no',        symbol: '❌' },
      { word: 'please',    symbol: '🙏' },
      { word: 'thank you', symbol: '💖' },
      { word: 'hi',        symbol: '👋' },
      { word: 'bye',       symbol: '✋' },
      { word: 'sorry',     symbol: '😔' },
      { word: 'more',      symbol: '➕' },
      { word: 'all done',  symbol: '🏁' },
      { word: 'help',      symbol: '🆘' }
    ]
  },
  {
    id: 'people',
    label: 'People',
    emoji: '🧑',
    color: '#E9B949',      // yellow - people
    colorLight: '#FBF1D7',
    colorDark: '#A07E22',
    words: [
      { word: 'I',      symbol: '🙋' },
      { word: 'you',    symbol: '👉' },
      { word: 'me',     symbol: '👤' },
      { word: 'we',     symbol: '👫' },
      { word: 'mum',    symbol: '👩' },
      { word: 'dad',    symbol: '👨' },
      { word: 'baby',   symbol: '👶' },
      { word: 'friend', symbol: '🧑‍🤝‍🧑' },
      { word: 'teacher', symbol: '🧑‍🏫' },
      { word: 'doctor', symbol: '🧑‍⚕️' }
    ]
  },
  {
    id: 'actions',
    label: 'Actions',
    emoji: '🏃',
    color: '#6FB26F',      // green - verbs
    colorLight: '#E4F1E3',
    colorDark: '#3C7A3C',
    words: [
      { word: 'want',  symbol: '🫴' },
      { word: 'need',  symbol: '‼️' },
      { word: 'go',    symbol: '🟢' },
      { word: 'stop',  symbol: '🛑' },
      { word: 'eat',   symbol: '🍽️' },
      { word: 'drink', symbol: '🥤' },
      { word: 'play',  symbol: '🧸' },
      { word: 'look',  symbol: '👀' },
      { word: 'sleep', symbol: '😴' },
      { word: 'read',  symbol: '📖' },
      { word: 'open',  symbol: '🔓' },
      { word: 'close', symbol: '🔒' }
    ]
  },
  {
    id: 'feelings',
    label: 'Feelings',
    emoji: '💗',
    color: '#C26ED6',      // violet - feelings
    colorLight: '#F4E3F8',
    colorDark: '#7C3A8D',
    words: [
      { word: 'happy',  symbol: '😊' },
      { word: 'sad',    symbol: '😢' },
      { word: 'mad',    symbol: '😠' },
      { word: 'scared', symbol: '😨' },
      { word: 'tired',  symbol: '😫' },
      { word: 'sick',   symbol: '🤒' },
      { word: 'love',   symbol: '❤️' },
      { word: 'silly',  symbol: '🤪' },
      { word: 'calm',   symbol: '😌' },
      { word: 'excited', symbol: '🤩' }
    ]
  },
  {
    id: 'describers',
    label: 'Describers',
    emoji: '🎨',
    color: '#5D8CD6',      // blue - adjectives
    colorLight: '#E1EAF7',
    colorDark: '#2E558C',
    words: [
      { word: 'big',    symbol: '🐘' },
      { word: 'little', symbol: '🐭' },
      { word: 'hot',    symbol: '🔥' },
      { word: 'cold',   symbol: '🥶' },
      { word: 'fast',   symbol: '🏎️' },
      { word: 'slow',   symbol: '🐢' },
      { word: 'good',   symbol: '👍' },
      { word: 'bad',    symbol: '👎' },
      { word: 'yummy',  symbol: '😋' },
      { word: 'yucky',  symbol: '🤢' },
      { word: 'loud',   symbol: '📢' },
      { word: 'quiet',  symbol: '🤫' }
    ]
  },
  {
    id: 'things',
    label: 'Things',
    emoji: '🧸',
    color: '#E88A3C',      // orange - nouns
    colorLight: '#FBE7D2',
    colorDark: '#9E561A',
    words: [
      { word: 'water',    symbol: '💧' },
      { word: 'food',     symbol: '🍎' },
      { word: 'snack',    symbol: '🍪' },
      { word: 'milk',     symbol: '🥛' },
      { word: 'toy',      symbol: '🧸' },
      { word: 'book',     symbol: '📚' },
      { word: 'ball',     symbol: '⚽' },
      { word: 'phone',    symbol: '📱' },
      { word: 'iPad',     symbol: '📲' },
      { word: 'blanket',  symbol: '🛌' },
      { word: 'shoes',    symbol: '👟' },
      { word: 'jacket',   symbol: '🧥' }
    ]
  },
  {
    id: 'places',
    label: 'Places',
    emoji: '🏠',
    color: '#4FB3A9',      // teal - places
    colorLight: '#DCEFEC',
    colorDark: '#256B64',
    words: [
      { word: 'home',     symbol: '🏠' },
      { word: 'school',   symbol: '🏫' },
      { word: 'park',     symbol: '🌳' },
      { word: 'shop',     symbol: '🛒' },
      { word: 'outside',  symbol: '☀️' },
      { word: 'inside',   symbol: '🚪' },
      { word: 'bathroom', symbol: '🚽' },
      { word: 'bed',      symbol: '🛏️' },
      { word: 'car',      symbol: '🚗' },
      { word: 'kitchen',  symbol: '🍽️' }
    ]
  },
  {
    id: 'questions',
    label: 'Questions',
    emoji: '❓',
    color: '#8A70D6',      // purple - questions
    colorLight: '#E7E2F7',
    colorDark: '#49388A',
    words: [
      { word: 'what',     symbol: '❓' },
      { word: 'where',    symbol: '📍' },
      { word: 'who',      symbol: '🧍' },
      { word: 'when',     symbol: '⏰' },
      { word: 'why',      symbol: '🤔' },
      { word: 'how',      symbol: '🛠️' }
    ]
  }
];
