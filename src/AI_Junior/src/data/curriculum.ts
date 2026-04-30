export interface Module {
  id: number;
  title: string;
  phase: number;
  description: string;
  concept: string;
  minilab: string;
  reward: string;
  type: string;
  x: number; 
  y: number; 
}

export const CURRICULUM: Module[] = [
  // Compact Layout: Fits within ~1000x800 area for "One Screen" feel
  { id: 1, phase: 1, title: "What is a Brain?", description: "Human vs. Computer", concept: "Intelligence", minilab: "sorting", reward: "Brain Badge", type: "Lab", x: 150, y: 600 },
  { id: 2, phase: 1, title: "Training a Pet Robot", description: "Intro to ML", concept: "Training Data", minilab: "classifier", reward: "Robot Sticker", type: "SpaceStation", x: 350, y: 550 },
  { id: 3, phase: 1, title: "How AI Sees", description: "Computer Vision", concept: "Pixels & Patterns", minilab: "drawing", reward: "Magic Eye", type: "Lab", x: 550, y: 600 },
  { id: 4, phase: 1, title: "How AI Hears", description: "NLP Basics", concept: "Sound to Text", minilab: "voice", reward: "Sonic Ear", type: "Forest", x: 750, y: 550 },
  { id: 5, phase: 1, title: "The Magic Library", description: "What is an LLM?", concept: "Reading everything", minilab: "library", reward: "Gold Book", type: "Portal", x: 950, y: 600 },
  { id: 6, phase: 1, title: "Meet the AI Family", description: "Models", concept: "AI Core", minilab: "family-tree", reward: "AI Core", type: "SpaceStation", x: 1050, y: 450 },

  { id: 7, phase: 2, title: "The Magic Words", description: "Prompting", concept: "Instructions", minilab: "sandwich-maker", reward: "Wand", type: "Lab", x: 950, y: 300 },
  { id: 8, phase: 2, title: "What is a Token?", description: "Lego blocks", concept: "Tokens", minilab: "token-builder", reward: "Lego", type: "Forest", x: 750, y: 350 },
  { id: 9, phase: 2, title: "Memory Backpack", description: "Context Window", concept: "Memory", minilab: "backpack", reward: "Smart Bag", type: "SpaceStation", x: 550, y: 300 },
  { id: 10, phase: 2, title: "Giving AI a Role", description: "Pirate vs Doctor", concept: "Personas", minilab: "costume", reward: "Mask", type: "Lab", x: 350, y: 350 },
  { id: 11, phase: 2, title: "Safety Rules", description: "Guardrails", concept: "Safety", minilab: "fence", reward: "Shield", type: "Portal", x: 150, y: 300 },
  { id: 12, phase: 2, title: "Boss Challenge 1", description: "App Creation", concept: "Integration", minilab: "story", reward: "Trophy 1", type: "SpaceStation", x: 80, y: 200 },

  { id: 13, phase: 3, title: "The Creativity Dial", description: "Temperature", concept: "Predictability", minilab: "temp", reward: "Fire", type: "Lab", x: 150, y: 100 },
  { id: 14, phase: 3, title: "Word Selection", description: "Top-K", concept: "Selection", minilab: "bowl", reward: "Bucket", type: "Forest", x: 350, y: 150 },
  { id: 15, phase: 3, title: "Probability Cloud", description: "Top-P", concept: "Probability", minilab: "cloud", reward: "Storm", type: "SpaceStation", x: 550, y: 100 },
  { id: 16, phase: 3, title: "Stop Sequences", description: "The Brakes", concept: "Stopping", minilab: "stop", reward: "Pedal", type: "Lab", x: 750, y: 150 },
  { id: 17, phase: 3, title: "No Parrots!", description: "Frequency", concept: "Repetition", minilab: "mute", reward: "Mute", type: "Forest", x: 950, y: 100 },
  { id: 18, phase: 3, title: "Boss Challenge 2", description: "Joke Gen", concept: "Tuning", minilab: "joke", reward: "Trophy 2", type: "SpaceStation", x: 1050, y: 150 },

  { id: 19, phase: 4, title: "Cloud vs Pocket", description: "Where AI lives", concept: "Cloud", minilab: "sort", reward: "Phone", type: "Portal", x: 950, y: 50 },
  { id: 20, phase: 4, title: "Your Own Pet AI", description: "Local LLMs", concept: "Ollama", minilab: "pet", reward: "House", type: "Lab", x: 750, y: 20 },
  { id: 21, phase: 4, title: "Secrets Safe", description: "Privacy", concept: "Privacy", minilab: "vault", reward: "Key", type: "Portal", x: 550, y: 50 },
  { id: 22, phase: 4, title: "AI Studio", description: "Dev Tools", concept: "Studio", minilab: "sim", reward: "Pass", type: "SpaceStation", x: 350, y: 20 },
  { id: 23, phase: 4, title: "Vibe Coding", description: "Building", concept: "Code", minilab: "ball", reward: "Sparkles", type: "Lab", x: 150, y: 50 },
  { id: 24, phase: 4, title: "Final Graduation", description: "Master", concept: "Mastery", minilab: "final", reward: "Cap", type: "Portal", x: 50, y: 20 },
];

export const curriculum = CURRICULUM;
