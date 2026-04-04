export type QuestionType = "mc" | "open";

export interface MCOption {
    id: string; // "a", "b", "c"
    label: string; // Display text
}

export interface Question {
    id: number; // 1–10
    text: string; // The question
    type: QuestionType;
    options?: MCOption[]; // Only for MC questions
    placeholder?: string; // Only for OE questions
}

export const questions: Question[] = [
    {
        id: 1,
        text: "When facing a big task, how do you start?",
        type: "mc",
        options: [
            { id: "a", label: "Plan every step first" },
            { id: "b", label: "Start immediately, figure out details later" },
            { id: "c", label: "Delay until I feel ready" },
        ],
    },
    {
        id: 2,
        text: "How do you handle stress?",
        type: "mc",
        options: [
            { id: "a", label: "Exercise / physical activity" },
            { id: "b", label: "Talk to friends" },
            { id: "c", label: "Worry quietly / ruminate" },
        ],
    },
    {
        id: 3,
        text: "What motivates you most?",
        type: "mc",
        options: [
            { id: "a", label: "Clear deadlines" },
            { id: "b", label: "Personal satisfaction" },
            { id: "c", label: "External rewards (grades, recognition)" },
        ],
    },
    {
        id: 4,
        text: "When given multiple options, how do you decide?",
        type: "mc",
        options: [
            { id: "a", label: "Analyze all pros/cons" },
            { id: "b", label: "Choose the easiest / most comfortable" },
            { id: "c", label: "Flip a coin / act randomly" },
        ],
    },
    {
        id: 5,
        text: "How do you respond to feedback?",
        type: "mc",
        options: [
            { id: "a", label: "Reflect deeply and adjust" },
            { id: "b", label: "Take it personally" },
            { id: "c", label: "Ignore or brush it off" },
        ],
    },
    {
        id: 6,
        text: "How do you approach learning new skills?",
        type: "mc",
        options: [
            { id: "a", label: "Structured step-by-step" },
            { id: "b", label: "Trial and error" },
            { id: "c", label: "Only when necessary" },
        ],
    },
    {
        id: 7,
        text: "When overwhelmed, what's your default reaction?",
        type: "mc",
        options: [
            { id: "a", label: "Break down tasks and prioritize" },
            { id: "b", label: "Avoid tasks and procrastinate" },
            { id: "c", label: "Stress, overthink, and do nothing" },
        ],
    },
    {
        id: 8,
        text: "How do you like to be nudged?",
        type: "mc",
        options: [
            { id: "a", label: "Gentle encouragement" },
            { id: "b", label: "Firm, direct guidance" },
            { id: "c", label: "Logical explanation and reasoning" },
        ],
    },
    // {
    //   id: 9,
    //   text: "Describe your biggest challenge in a few sentences",
    //   type: "open",
    //   placeholder: "e.g., I keep putting off assignments until the last minute...",
    // },
    // {
    //   id: 10,
    //   text: "What type of advice do you prefer?",
    //   type: "open",
    //   placeholder: "e.g., I want someone to be straightforward with me...",
    // },
];
