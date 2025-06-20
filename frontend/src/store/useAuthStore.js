import {create} from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/"
 
//It creates a Zustand store to manage and share authentication state like authUser, isSigningUp, etc.

export const useAuthStore = create((set, get) => ({
    authUser: null,  //If the user is authenticated, it saves the user data in authUser, If not, it sets authUser to null
    isSigningUp: false,  //loading when sign up, dot dot dot will show
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try{                   //.get is use here to fetch the data from backend
            const res = await axiosInstance.get("/auth/check");  //"Is the user already logged in or authenticated?"
            set({ authUser: res.data});
            get().connectSocket();
        } catch (error){
            console.log("Error in checkAuth:", error);
            set({authUser: null});
        } finally{
            set({ isCheckingAuth: false});
        }
    },


    signup: async (data) => {
        set({ isSigningUp: true });
        try{
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data});
            toast.success("Account created Successfully");
            
        } catch (error){
            //toast.error(error.response.data.message) || "already signup go to login"
             // Safely extract error message
            const message =
              error.response?.data?.message || "Gmail is already in use";
            toast.error(message);
        } finally{
            set({ isSigningUp: false});
        }
    },


    login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();

    } catch (error) {
      toast.error(error.response.data.message);
    } finally { 
      set({ isLoggingIn: false });
    }
  },


    logout: async () => {
        try{
          await axiosInstance.post("/auth/logout");
          set({ authUser: null });
          toast.success("Logged out successfully");
          get().disconnectSocket();
          
        } catch(error){
          toast.error(error.response.data.message);
        }
    },


    updateProfile: async (data) => {
      set({isUpdatingProfile: true});
      try{
         const res = await axiosInstance.put("/auth/update-profile", data);
         set({ authUser: res.data });
         toast.success("profile updated successfully");
      } catch (error) {
        console.log("error in update profile:", error.message);
        console.error(error);

        toast.error(error.response.data.message);
      } finally{
        set({isUpdatingProfile: false})
      }
    },


    connectSocket: () => {
      const {authUser} = get()
      if(!authUser || get().socket?.connected) return;

      const socket = io(BASE_URL,{
        query:{       //sab ko ye batane ke liye ki someone is came online now
          userId: authUser._id,
        },
      });

      socket.connect();

      set({ socket: socket});

      socket.on("getOnlineUsers", (userIds) => {
        set({ onlineUsers: userIds });
      });
    },

    disconnectSocket: () => {
      if(get().socket?.connected) get().socket.disconnect();
    },
}));