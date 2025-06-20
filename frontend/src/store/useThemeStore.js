import { create } from "zustand";

export const useThemeStore = create((set) =>({ // export the useThemeStore fromm here and import in App.jsx
    theme: localStorage.getItem("chat-theme") || "coffee",
    setTheme: (theme) => {
        localStorage.setItem("chat-theme", theme);
        set({ theme });
    },
}));