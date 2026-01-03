const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Goal = require('./models/Goal');
const DailyRoutine = require('./models/DailyRoutine');
const WeeklyPlan = require('./models/WeeklyPlan');

dotenv.config();

const seedSchedule = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected for Seeding');

        // Find a default user (or all users) to seed data for
        const users = await User.find();
        if (users.length === 0) {
            console.log('❌ No users found. Please register a user first.');
            process.exit(1);
        }

        // Seed for ALL users found
        for (const user of users) {
            console.log(`🌱 Seeding data for user: ${user.username} (${user._id})`);

            // 1. Create specific "Google Crack" Goal
            await Goal.deleteMany({ user: user._id }); // Clear existing goals for seed purity

            const googleGoal = new Goal({
                user: user._id,
                title: "Google Crack",
                description: "Master Data Structures, Algorithms, and System Design to crack the Google interview.",
                deadline: new Date("2026-06-01"),
                progress: 0,
                completed: false
            });
            await googleGoal.save();
            console.log(`   ✅ Goal Created: Google Crack`);

            // --- Daily Routine Data ---
            const dailyData = [
                { timeSlot: "05:30 – 06:00", period: "Wake Up", activity: "Cold Shower. Black Coffee. No Phone.", intensity: "⚡ Alert", order: 1 },
                { timeSlot: "06:00 – 07:00", period: "Morning 1", activity: "Concept Injection: Watch the tutorial/video for the Week's Topic. Do not code. Understand the Logic.", intensity: "🧠 High", order: 2 },
                { timeSlot: "07:00 – 08:30", period: "Morning 2", activity: "The Hard Problem: Attempt 1 'Hard' problem related to the topic. Struggle with it. If stuck >45m, look at solution logic.", intensity: "🔥 Extreme", order: 3 },
                { timeSlot: "08:30 – 09:00", period: "Commute", activity: "Listen to System Design Podcasts or Audio recordings of behavioral answers.", intensity: "🎧 Passive", order: 4 },
                { timeSlot: "09:00 – 13:00", period: "JOB", activity: "Focus on your work.", intensity: "💼 Work", order: 5 },
                { timeSlot: "13:00 – 14:00", period: "Mid-Day", activity: "Lunch & Learn: Read 1 System Design Case Study (e.g., 'How Discord works') or read code solutions. NO CODING.", intensity: "📖 Study", order: 6 },
                { timeSlot: "14:00 – 18:00", period: "JOB", activity: "Focus on your work.", intensity: "💼 Work", order: 7 },
                { timeSlot: "18:00 – 19:30", period: "Evening", activity: "Commute, Gym, Dinner. Brain Reset. (Do not study here).", intensity: "🔋 Recharge", order: 8 },
                { timeSlot: "19:30 – 22:30", period: "Night 1", activity: "The Grind: Solve 3 Medium Problems. Rule: 25 mins per problem. Strict Timer.", intensity: "🔥 Extreme", order: 9 },
                { timeSlot: "22:30 – 23:00", period: "Night 2", activity: "Retrospective: Review the code you wrote. Note down why you made bugs. Plan tomorrow.", intensity: "📉 Low", order: 10 },
                { timeSlot: "23:00", period: "Sleep", activity: "Sleep is mandatory for memory retention.", intensity: "💤 Rest", order: 11 }
            ];

            await DailyRoutine.deleteMany({ user: user._id });
            const routineDocs = dailyData.map(d => ({ ...d, user: user._id, goal: googleGoal._id }));
            await DailyRoutine.insertMany(routineDocs);
            console.log(`   ✅ Daily Routine Seeded for ${user.username}`);

            // --- Weekly Plan Data ---
            const weeklyData = [
                // PHASE 1: FOUNDATION & PATTERNS
                {
                    phase: "PHASE 1: FOUNDATION & PATTERNS (Weeks 1-4)", week: 1, topic: "Arrays & Hashing",
                    morningMission: "Big O, Dynamic Arrays, HashMaps, Prefix Sum",
                    nightMission: "Contains Duplicate, Anagrams, Top K Frequent, product excepto self",
                    days: [
                        { day: "Mon", morningTask: "Big O & Dynamic Arrays", nightTask: "Contains Duplicate, Valid Anagram" },
                        { day: "Tue", morningTask: "HashMaps internals", nightTask: "Group Anagrams, Top K Frequent" },
                        { day: "Wed", morningTask: "Prefix Sum logic", nightTask: "Product of Array Except Self, Valid Sudoku" },
                        { day: "Thu", morningTask: "Sorting Algos", nightTask: "Longest Consecutive Sequence, Encode/Decode" },
                        { day: "Fri", morningTask: "Review Week 1 Hard", nightTask: "Trapping Rain Water (Hard)" }
                    ]
                },
                {
                    phase: "PHASE 1: FOUNDATION & PATTERNS (Weeks 1-4)", week: 2, topic: "Two Pointers & Sliding Window",
                    morningMission: "2-Pointer Logic, 3-Pointer, Fixed/Variable Window",
                    nightMission: "Valid Palindrome, Two Sum II, 3Sum, Container With Most Water",
                    days: [
                        { day: "Mon", morningTask: "2-Pointer Logic", nightTask: "Valid Palindrome, Two Sum II" },
                        { day: "Tue", morningTask: "3-Pointer (3Sum)", nightTask: "3Sum, Container With Most Water" },
                        { day: "Wed", morningTask: "Fixed vs Variable Window", nightTask: "Best Time to Buy/Sell Stock, Longest Substring" },
                        { day: "Thu", morningTask: "Window Optimization", nightTask: "Permutation in String, Min Window Substring" },
                        { day: "Fri", morningTask: "Review Week 2 Hard", nightTask: "Sliding Window Maximum (Hard)" }
                    ]
                },
                {
                    phase: "PHASE 1: FOUNDATION & PATTERNS (Weeks 1-4)", week: 3, topic: "Stack & Binary Search",
                    morningMission: "Monotonic Stack, Recursion, Binary Search Logic",
                    nightMission: "Valid Parentheses, Min Stack, Generate Parentheses",
                    days: [
                        { day: "Mon", morningTask: "Monotonic Stack", nightTask: "Valid Parentheses, Min Stack" },
                        { day: "Tue", morningTask: "Recursion Stack", nightTask: "Generate Parentheses, Daily Temperatures" },
                        { day: "Wed", morningTask: "Binary Search Logic", nightTask: "Binary Search, Koko Eating Bananas" },
                        { day: "Thu", morningTask: "Rotated Array Logic", nightTask: "Find Min in Rotated Array, Search Rotated Array" },
                        { day: "Fri", morningTask: "Review Week 3 Hard", nightTask: "Largest Rectangle in Histogram (Hard)" }
                    ]
                },
                {
                    phase: "PHASE 1: FOUNDATION & PATTERNS (Weeks 1-4)", week: 4, topic: "Linked Lists",
                    morningMission: "Pointer Manipulation, Fast & Slow Pointers, LRU Cache",
                    nightMission: "Reverse Linked List, Reorder List, Remove Nth Node",
                    days: [
                        { day: "Mon", morningTask: "Pointer Manipulation", nightTask: "Reverse Linked List, Reorder List" },
                        { day: "Tue", morningTask: "Fast & Slow Pointers", nightTask: "Remove Nth Node, Linked List Cycle" },
                        { day: "Wed", morningTask: "LRU Cache Design", nightTask: "Copy List with Random Pointer, LRU Cache" },
                        { day: "Thu", morningTask: "Merge Logic", nightTask: "Add Two Numbers, Find Duplicate Number" },
                        { day: "Fri", morningTask: "Review Week 4 Hard", nightTask: "Merge k Sorted Lists (Hard)" }
                    ]
                },

                // PHASE 2: THE GOOGLE FILTER
                {
                    phase: "PHASE 2: THE GOOGLE FILTER (Weeks 5-8)", week: 5, topic: "Trees (BST & Binary)",
                    morningMission: "Recursion Depth, Balanced Trees, BFS",
                    nightMission: "Invert Tree, Diameter of Binary Tree, Balanced Binary Tree",
                    days: [
                        { day: "Mon", morningTask: "Recursion Depth", nightTask: "Invert Tree, Diameter of Binary Tree" },
                        { day: "Tue", morningTask: "Balanced Trees", nightTask: "Balanced Binary Tree, Same Tree" },
                        { day: "Wed", morningTask: "BFS (Level Order)", nightTask: "Level Order Traversal, Right Side View" },
                        { day: "Thu", morningTask: "BST Properties", nightTask: "Validate BST, Kth Smallest Element" },
                        { day: "Fri", morningTask: "Review Week 5 Hard", nightTask: "Binary Tree Max Path Sum (Hard)" }
                    ]
                },
                {
                    phase: "PHASE 2: THE GOOGLE FILTER (Weeks 5-8)", week: 6, topic: "Tries / Backtrack / Heap",
                    morningMission: "Trie Structure, Backtracking State, Priority Queue",
                    nightMission: "Implement Trie, Word Search, Subsets",
                    days: [
                        { day: "Mon", morningTask: "Trie Structure", nightTask: "Implement Trie, Word Search" },
                        { day: "Tue", morningTask: "Backtracking State", nightTask: "Subsets, Combination Sum, Permutations" },
                        { day: "Wed", morningTask: "Priority Queue (Heap)", nightTask: "Kth Largest Element, Task Scheduler" },
                        { day: "Thu", morningTask: "Advanced Heaps", nightTask: "Design Twitter, Last Stone Weight" },
                        { day: "Fri", morningTask: "Review Week 6 Hard", nightTask: "Find Median from Data Stream (Hard)" }
                    ]
                },
                {
                    phase: "PHASE 2: THE GOOGLE FILTER (Weeks 5-8)", week: 7, topic: "GRAPHS (CRITICAL)",
                    morningMission: "DFS/BFS on Matrix, Topological Sort, Union Find",
                    nightMission: "Number of Islands, Max Area of Island, Rotting Oranges",
                    days: [
                        { day: "Mon", morningTask: "DFS/BFS on Matrix", nightTask: "Number of Islands, Max Area of Island" },
                        { day: "Tue", morningTask: "Topological Sort", nightTask: "Rotting Oranges, Pacific Atlantic Water Flow" },
                        { day: "Wed", morningTask: "Union Find", nightTask: "Course Schedule, Redundant Connection" },
                        { day: "Thu", morningTask: "Dijkstra's Algo", nightTask: "Network Delay Time, Graph Valid Tree" },
                        { day: "Fri", morningTask: "Review Week 7 Hard", nightTask: "Alien Dictionary (Hard)" }
                    ]
                },
                {
                    phase: "PHASE 2: THE GOOGLE FILTER (Weeks 5-8)", week: 8, topic: "Dynamic Programming",
                    morningMission: "Memoization Basics, Palindromes (DP), Knapsack",
                    nightMission: "Climbing Stairs, House Robber, Longest Palindromic Substring",
                    days: [
                        { day: "Mon", morningTask: "Memoization Basics", nightTask: "Climbing Stairs, House Robber" },
                        { day: "Tue", morningTask: "Palindromes (DP)", nightTask: "Longest Palindromic Substring, Decode Ways" },
                        { day: "Wed", morningTask: "Knapsack Pattern", nightTask: "Coin Change, Word Break" },
                        { day: "Thu", morningTask: "Grid DP (2D)", nightTask: "Unique Paths, Longest Common Subsequence" },
                        { day: "Fri", morningTask: "Review Week 8 Hard", nightTask: "Edit Distance (Hard)" }
                    ]
                },

                // PHASE 3: DESIGN & POLISH
                {
                    phase: "PHASE 3: DESIGN & POLISH (Weeks 9-12)", week: 9, topic: "HLD (High Level Design)",
                    morningMission: "Design URL Shortener, YouTube, Twitter",
                    nightMission: "Speed Run: Arrays, Sliding Window, Stack",
                    days: [
                        { day: "Mon", morningTask: "Design URL Shortener", nightTask: "Speed Run: Arrays (5 Problems in 1hr)" },
                        { day: "Tue", morningTask: "Design YouTube", nightTask: "Speed Run: Slid. Window (5 Problems in 1hr)" },
                        { day: "Wed", morningTask: "Design Twitter", nightTask: "Speed Run: Stack (5 Problems in 1hr)" },
                        { day: "Thu", morningTask: "Design Chat App", nightTask: "Speed Run: Linked List (5 Problems in 1hr)" },
                        { day: "Fri", morningTask: "Design Rate Limiter", nightTask: "Meeting Rooms II (Intervals)" }
                    ]
                },
                {
                    phase: "PHASE 3: DESIGN & POLISH (Weeks 9-12)", week: 10, topic: "LLD (Object Oriented)",
                    morningMission: "Design Parking Lot, Elevator, Movie Ticket System",
                    nightMission: "Speed Run: Trees, Graphs, DP",
                    days: [
                        { day: "Mon", morningTask: "Design Parking Lot", nightTask: "Speed Run: Trees (Focus on Recursion)" },
                        { day: "Tue", morningTask: "Design Elevator", nightTask: "Speed Run: Graphs (Focus on BFS)" },
                        { day: "Wed", morningTask: "Movie Ticket System", nightTask: "Speed Run: DP (Focus on Memoization)" },
                        { day: "Thu", morningTask: "Logging Framework", nightTask: "Merge Intervals, Non-overlapping Intervals" },
                        { day: "Fri", morningTask: "Vending Machine", nightTask: "Jump Game, Gas Station" }
                    ]
                },
                {
                    phase: "PHASE 3: DESIGN & POLISH (Weeks 9-12)", week: 11, topic: "Mock Interviews",
                    morningMission: "Mock Interview (Pramp), Peer Mocks",
                    nightMission: "Fix mistakes from Mock, Solve Random Hard Problem",
                    days: [
                        { day: "Mon", morningTask: "Mock Interview (Pramp)", nightTask: "Fix mistakes from Morning Mock" },
                        { day: "Tue", morningTask: "Solve/Review", nightTask: "Solve Random Hard Problem" },
                        { day: "Wed", morningTask: "Mock Interview (Peer)", nightTask: "Fix mistakes from Morning Mock" },
                        { day: "Thu", morningTask: "Solve/Review", nightTask: "Solve Random Hard Problem" },
                        { day: "Fri", morningTask: "Mock Interview (Pramp)", nightTask: "Fix mistakes from Morning Mock" }
                    ]
                },
                {
                    phase: "PHASE 3: DESIGN & POLISH (Weeks 9-12)", week: 12, topic: "Final Polish",
                    morningMission: "Review 'Mistake Log', Leadership Principles",
                    nightMission: "Solve Top 20 Google Tagged Questions",
                    days: [
                        { day: "Mon-Fri", morningTask: "Review 'Mistake Log', Leadership Principles", nightTask: "Solve Top 20 Google Tagged Questions" }
                    ]
                }
            ];

            await WeeklyPlan.deleteMany({ user: user._id });
            const planDocs = weeklyData.map(w => ({ ...w, user: user._id, goal: googleGoal._id }));
            await WeeklyPlan.insertMany(planDocs);
            console.log(`   ✅ Weekly Plan Seeded for ${user.username}`);
        }
    } catch (err) {
        console.error('❌ Seeding Error:', err);
        process.exit(1);
    }
};

seedSchedule();
