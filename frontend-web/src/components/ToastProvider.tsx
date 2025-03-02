"use client";                                                                                                                              
                                                                                                                                            
import { ToastContainer } from "react-toastify";                                                                                           
import "react-toastify/dist/ReactToastify.css";  
import "../app/globals.css"; // Upewnij się, że ścieżka jest poprawna                                                                                                                       
                                                                                                                                           
export default function ToastProvider() {                                                                                                  
  return (                                                                                                                                 
    <ToastContainer                                                                                                                        
      aria-label="notification"                                                                                                            
      position="bottom-center"                                                                                                                 
      autoClose={5000}                                                                                                                     
      hideProgressBar={false}                                                                                                              
      newestOnTop={false}                                                                                                                  
      closeOnClick                                                                                                                         
      rtl={false}                                                                                                                          
      pauseOnFocusLoss                                                                                                                     
      draggable                                                                                                                            
      pauseOnHover
      theme="colored"
    />                                                                                                                                     
  );                                                                                                                                       
} 