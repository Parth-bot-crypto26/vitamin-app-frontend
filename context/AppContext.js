import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AppContext = createContext();

export const THEMES = {
  light: { bg: '#FAFAFA', surface: '#FFFFFF', text: '#18181b', textLight: '#71717a', primary: '#F97316', border: '#E4E4E7', icon: 'black' },
  dark: { bg: '#09090b', surface: '#18181b', text: '#FAFAFA', textLight: '#A1A1AA', primary: '#F97316', border: '#27272A', icon: 'white' },
  vscode: { bg: '#1E1E1E', surface: '#252526', text: '#D4D4D4', textLight: '#858585', primary: '#007ACC', border: '#333333', icon: '#D4D4D4' },
  antigravity: { bg: '#0F172A', surface: '#1E293B', text: '#F8FAFC', textLight: '#94A3B8', primary: '#A855F7', border: '#334155', icon: '#E2E8F0' },
  hacker: { bg: '#000000', surface: '#111111', text: '#00FF00', textLight: '#008800', primary: '#00FF00', border: '#003300', icon: '#00FF00' },
  dracula: { bg: '#282a36', surface: '#44475a', text: '#f8f8f2', textLight: '#6272a4', primary: '#ff79c6', border: '#44475a', icon: '#bd93f9' }
};

// === THE FINAL 6-USER DATABASE ===
export const INITIAL_USERS = [
  // 1. PARTH (AI & ML) - The Power User
  {
    id: "u1", username: "23BAI10120", name: "Parth Deshpande", branch: "CSE (AI & ML)", 
    avatar: "P", cgpa: 9.97, attendance: 97,
    schedule: [
      { time: "08:30", title: "Data Mining (CSA3006)", loc: "AB1-404", type: "Theory", status: "Done" },
      { time: "10:05", title: "Deep Learning (CSA3007)", loc: "AB2-428", type: "Lab", status: "Done" },
      { time: "11:40", title: "Natural Lang. Proc (CSA4028)", loc: "AB1-204", type: "Theory", status: "Live" },
      { time: "14:50", title: "Free Slot", loc: "Library", type: "Chill", status: "Chill" }, // Matches with Ansh
      { time: "16:25", title: "Reinforcement Learning (CSA4029)", loc: "LC-2", type: "Lab", status: "Upcoming" },
      { time: "18:00", title: "Computer Vision (CSE3010)", loc: "AR-103", type: "Theory", status: "Upcoming" }
    ],
    goals: {
      Academic: [
        { id: 1, title: "Solve 5 LeetCode Hard", progress: 0.6, streak: 12 }, 
        { id: 2, title: "Finish NLP Project", progress: 0.2, streak: 1 },
        { id: 3, title: "Revise Data Mining Notes", progress: 0.0, streak: 0 }
      ],
      Career: [
        { id: 4, title: "AWS Cloud Prac. Cert", progress: 0.3, streak: 4 },
        { id: 5, title: "Update LinkedIn Profile", progress: 1.0, streak: 1 }
      ],
      Personal: [
        { id: 6, title: "Gym - Leg Day", progress: 0.0, streak: 22 },
        { id: 7, title: "Read 'Atomic Habits'", progress: 0.45, streak: 5 }
      ],
      Financial: [
        { id: 8, title: "Save ₹500 this week", progress: 0.8, streak: 5 },
        { id: 9, title: "Track Monthly Expenses", progress: 0.5, streak: 15 }
      ]
    },
    chats: { "u2": [], "u3": [], "u4": [], "u5": [], "u6": [] } 
  },

  // 2. ANSH (Edu Tech) - Matches Free Slot with Parth
  {
    id: "u2", username: "23BET10008", name: "Ansh Lachhwani", branch: "CSE (Edu Tech)", 
    avatar: "AL", cgpa: 9.90, attendance: 94,
    schedule: [
      { time: "09:00", title: "Game Design Principles", loc: "Lab-1", type: "Lab", status: "Done" },
      { time: "11:40", title: "Instructional Design", loc: "AB2-303", type: "Theory", status: "Live" },
      { time: "13:15", title: "EdPsychology", loc: "AB2-101", type: "Theory", status: "Upcoming" },
      { time: "14:50", title: "Free Slot", loc: "Food Court", type: "Chill", status: "Chill" }, // Matches with Parth
      { time: "16:25", title: "Operating Systems (CSE3003)", loc: "AB1-205", type: "Theory", status: "Upcoming" },
      { time: "18:00", title: "Computer Networks (CSE3006)", loc: "AB3-404", type: "Lab", status: "Upcoming" }
    ],
    goals: {
      Academic: [
        { id: 1, title: "Unity Engine Basics", progress: 0.9, streak: 30 },
        { id: 2, title: "Complete Game Asset Pack", progress: 0.5, streak: 7 },
        { id: 3, title: "Study EdTech Case Studies", progress: 0.2, streak: 2 }
      ],
      Extracurricular: [
        { id: 4, title: "Guitar Practice", progress: 0.5, streak: 10 },
        { id: 5, title: "Music Club Jam", progress: 0.0, streak: 1 }
      ],
      Career: [
        { id: 6, title: "Build Portfolio Website", progress: 0.7, streak: 14 }
      ]
    },
    chats: { "u1": [], "u3": [], "u6": [] }
  },

  // 3. AALYA (CSE Core) - The Scholar
  {
    id: "u3", username: "23BCE11647", name: "Aalya Bagga", branch: "CSE (Core)", 
    avatar: "AB", cgpa: 9.65, attendance: 98,
    schedule: [
      { time: "08:30", title: "Compiler Design (CSE2004)", loc: "AB1-105", type: "Theory", status: "Done" },
      { time: "10:05", title: "DBMS (CSE3001)", loc: "AB1-202", type: "Theory", status: "Done" },
      { time: "11:40", title: "Operating Systems (CSE3003)", loc: "LC-5", type: "Lab", status: "Live" },
      { time: "14:50", title: "Java Programming (CSE2006)", loc: "AB3-201", type: "Lab", status: "Upcoming" },
      { time: "16:25", title: "Free Slot", loc: "Hostel", type: "Chill", status: "Chill" }, // Matches with Vaibhavi
      { time: "18:00", title: "Cloud Computing (CSA3005)", loc: "AB2-401", type: "Theory", status: "Upcoming" }
    ],
    goals: {
      Academic: [
        { id: 1, title: "Research Paper Draft", progress: 0.4, streak: 5 },
        { id: 2, title: "Review OS Kernel Concepts", progress: 0.8, streak: 8 },
        { id: 3, title: "Solve SQL 50 on LeetCode", progress: 0.3, streak: 3 }
      ],
      Career: [
        { id: 4, title: "Apply for Summer Internships", progress: 0.1, streak: 0 },
        { id: 5, title: "Mock Interview Prep", progress: 0.0, streak: 0 }
      ],
      Personal: [
        { id: 6, title: "Morning Yoga", progress: 1.0, streak: 45 }
      ]
    },
    chats: { "u1": [], "u2": [], "u4": [] }
  },

  // 4. VAIBHAVI (CSE Core) - Matches Free Slot with Aalya
  {
    id: "u4", username: "23BCE10875", name: "Vaibhavi Singh", branch: "CSE (Core)", 
    avatar: "VS", cgpa: 9.77, attendance: 76,
    schedule: [
      { time: "09:00", title: "OOP with C++ (CSE2001)", loc: "AB3-404", type: "Theory", status: "Done" },
      { time: "10:05", title: "Calculus (MAT1001)", loc: "AB1-101", type: "Theory", status: "Done" },
      { time: "11:40", title: "Engineering Physics (PHY1001)", loc: "Lab-3", type: "Lab", status: "Live" },
      { time: "14:50", title: "AWS Cloud Practitioner", loc: "AB2-101", type: "Theory", status: "Upcoming" },
      { time: "16:25", title: "Free Slot", loc: "Hostel", type: "Chill", status: "Chill" }, // Matches with Aalya
      { time: "18:00", title: "Emotional Intelligence (HUM1002)", loc: "AB1-516", type: "Theory", status: "Upcoming" }
    ],
    goals: { 
      Personal: [
        { id: 1, title: "Meditation (15 mins)", progress: 1.0, streak: 50 },
        { id: 2, title: "Drink 3L Water", progress: 0.6, streak: 12 }
      ],
      Academic: [
        { id: 3, title: "Physics Lab Record", progress: 0.0, streak: 0 },
        { id: 4, title: "C++ Project", progress: 0.5, streak: 4 }
      ],
      Financial: [
        { id: 5, title: "No Outside Food Challenge", progress: 1.0, streak: 3 }
      ]
    },
    chats: { "u3": [], "u1": [] }
  },

  // 5. ANSHIKA (Mechanical) - Different Stream
  {
    id: "u5", username: "23BMR10019", name: "Anshika Debroy", branch: "Mechanical", 
    avatar: "AD", cgpa: 9.83, attendance: 81,
    schedule: [
      { time: "08:30", title: "Eng. Design & Modelling (MEE2014)", loc: "CAD Lab", type: "Lab", status: "Done" },
      { time: "10:05", title: "Thermodynamics", loc: "AB1-101", type: "Theory", status: "Done" },
      { time: "11:40", title: "Diff. Equations (MAT2001)", loc: "AB1-216", type: "Theory", status: "Live" },
      { time: "14:00", title: "Workshop Practice", loc: "Workshop", type: "Lab", status: "Upcoming" },
      { time: "16:25", title: "Tech Communication (ENG1004)", loc: "AB2-202", type: "Theory", status: "Upcoming" },
      { time: "18:00", title: "Env. Sustainability (CHY1006)", loc: "AB1-303", type: "Theory", status: "Upcoming" }
    ],
    goals: { 
      Academic: [
        { id: 1, title: "CAD Design Project", progress: 0.7, streak: 3 },
        { id: 2, title: "Thermodynamics Assignment", progress: 0.0, streak: 0 }
      ],
      Career: [
        { id: 3, title: "Core Company Research", progress: 0.2, streak: 1 }
      ],
      Extracurricular: [
        { id: 4, title: "Badminton Practice", progress: 0.5, streak: 5 }
      ]
    },
    chats: { "u1": [] }
  },

  // 6. VATSAL (Edu Tech) - The Developer
  {
    id: "u6", username: "23BET10016", name: "Vatsal Jain", branch: "CSE (Edu Tech)", 
    avatar: "VJ", cgpa: 7.9, attendance: 75,
    schedule: [
      { time: "09:00", title: "Web Development", loc: "Lab-4", type: "Lab", status: "Done" },
      { time: "11:40", title: "Instructional Design", loc: "AB2-303", type: "Theory", status: "Live" },
      { time: "13:15", title: "Free Slot", loc: "Ground", type: "Chill", status: "Chill" },
      { time: "14:50", title: "Computer Networks (CSE3006)", loc: "AB3-404", type: "Theory", status: "Upcoming" },
      { time: "16:25", title: "Linear Algebra (MAT3002)", loc: "AB1-216", type: "Theory", status: "Upcoming" },
      { time: "18:00", title: "Soft Skills (SST2003)", loc: "AB2-105", type: "Theory", status: "Upcoming" }
    ],
    goals: { 
      Financial: [
        { id: 1, title: "Track Expenses", progress: 0.2, streak: 2 },
        { id: 2, title: "Invest in SIP", progress: 1.0, streak: 6 }
      ],
      Academic: [
        { id: 3, title: "Full Stack Course", progress: 0.4, streak: 10 },
        { id: 4, title: "Submit Web Dev Project", progress: 0.8, streak: 2 }
      ],
      Personal: [
        { id: 5, title: "Sleep 8 Hours", progress: 0.5, streak: 1 }
      ]
    },
    chats: { "u2": [], "u1": [] }
  }
];

export const EVENTS = [
  { id: 1, date: "12 Oct", title: "HackTheFall 2.0", org: "CodeChef", time: "10:00 AM", loc: "Auditorium", type: "Tech", desc: "A massive 48-hour hackathon to build open-source projects. Winner gets ₹50,000 cash prize!" },
  { id: 2, date: "14 Oct", title: "RoboWars", org: "RoboVITics", time: "02:00 PM", loc: "Amphitheatre", type: "Tech", desc: "Enter your custom built RC bot into the arena and fight for glory in the annual RoboWars." },
  { id: 3, date: "14 Oct", title: "Game Jam", org: "GameDev Club", time: "05:00 PM", loc: "Lab-4", type: "Tech", desc: "Make a game from scratch in 24 hours based on a central theme. Snacks provided!" },
  { id: 4, date: "18 Oct", title: "Advitya Music Fest", org: "Music Club", time: "06:00 PM", loc: "Food Street", type: "Cultural", desc: "An evening of live bands, solo performances, and great food near the hostel blocks." },
  { id: 5, date: "20 Oct", title: "AI in Healthcare", org: "Google DSC", time: "11:00 AM", loc: "AB1-Hall", type: "Workshop", desc: "Learn how deep learning is revolutionizing telemedicine and diagnostics." },
  { id: 6, date: "22 Oct", title: "VIT Debate Cup", org: "DebSoc", time: "04:00 PM", loc: "LC-Hall 2", type: "Lit", desc: "Compete against some of the fiercest debaters on modern socio-economic topics." },
  { id: 7, date: "25 Oct", title: "StartUp Pitch Day", org: "E-Cell", time: "09:00 AM", loc: "Incubation Ctr", type: "Biz", desc: "Pitch your startup idea to angel investors and secure early-stage funding." },
  { id: 8, date: "28 Oct", title: "Cyber Security Bootcamp", org: "OWASP", time: "10:00 AM", loc: "Lab Complex", type: "Tech", desc: "Hands-on CTF solving and vulnerability scanning with industry experts." },
  { id: 9, date: "30 Oct", title: "Halloween Night", org: "Events Team", time: "07:00 PM", loc: "Hostel Ground", type: "Cultural", desc: "Spooky costumes, a haunted house maze, and Halloween-themed treats!" }
];

export const AppProvider = ({ children }) => {
  const [allUsers, setAllUsers] = useState(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [themeMode, setThemeMode] = useState('light');
  const [notificationPulse, setNotificationPulse] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem('vit_chats').then(data => {
      if (data) setAllUsers(JSON.parse(data));
    }).catch(()=>{});
  }, []);

  const updateAllUsers = (newUsers) => {
    setAllUsers(newUsers);
    AsyncStorage.setItem('vit_chats', JSON.stringify(newUsers)).catch(()=>{});
  };

  const triggerBellAnimation = () => {
    setNotificationPulse(prev => prev + 1);
  };

  const theme = THEMES[themeMode] || THEMES.light;

  const cycleTheme = () => {
    const keys = Object.keys(THEMES);
    const currentIndex = keys.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % keys.length;
    setThemeMode(keys[nextIndex]);
  };

  // We are using your machine's local IP address so your phone (Expo Go) can reach it!
  const API_URL = "http://10.80.216.54:8000";

  const fetchUserProfile = async (token) => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Fallback mock merge
        const mockUser = allUsers.find(u => u.username === data.registration_number) || allUsers[0];
        setCurrentUser({ 
           ...mockUser, 
           ...data, 
           goals: mockUser.goals, 
           chats: mockUser.chats, 
           schedule: mockUser.schedule, 
           attendance: mockUser.attendance 
        });
      } else {
        Alert.alert("Error", "Failed to fetch user profile");
      }
    } catch (e) {
      Alert.alert("Network Error", "Could not connect to backend");
    }
  };

  const login = async (username, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration_number: username, password })
      });
      const data = await res.json();
      if (res.ok) {
        setAuthToken(data.access_token);
        fetchUserProfile(data.access_token);
      } else {
        Alert.alert("Login Failed", data.detail || "Invalid credentials");
      }
    } catch (e) {
      Alert.alert("Network Error", "Could not connect to backend");
    }
  };

  const register = async (username, password, name, branch) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration_number: username, password, name, branch })
      });
      const data = await res.json();
      if (res.ok) {
        setAuthToken(data.access_token);
        fetchUserProfile(data.access_token);
      } else {
        Alert.alert("Registration Failed", data.detail || "Error registering");
      }
    } catch (e) {
      Alert.alert("Network Error", "Could not connect to backend");
    }
  };


  const logout = () => {
    setCurrentUser(null);
    setAuthToken(null);
  };

  return (
    <AppContext.Provider value={{ currentUser, authToken, allUsers, updateAllUsers, setAllUsers, login, register, logout, API_URL, fetchUserProfile, themeMode, theme, cycleTheme, notificationPulse, triggerBellAnimation }}>
      {children}
    </AppContext.Provider>
  );
};