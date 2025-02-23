import { ReactNode, Fragment } from "react";                                                                                                          
 import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from "@headlessui/react";                                                                                               
                                                                                                                                                       
 interface CommonModalProps {                                                                                                                          
   open: boolean;                                                                                                                                      
   onClose: () => void;                                                                                                                                
   title: string;                                                                                                                                      
   children: ReactNode;                                                                                                                                
 }                                                                                                                                                     
                                                                                                                                                       
 const CommonModal: React.FC<CommonModalProps> = ({ open, onClose, title, children }) => {                                                             
   return (                                                                                                                                            
     <Transition appear show={open} as={Fragment}>                                                                                                     
       <Dialog as="div" className="relative z-10" onClose={onClose}>                                                                                   
         <TransitionChild                                                                                                                             
           as={Fragment}                                                                                                                               
           enter="ease-out duration-300"                                                                                                               
           enterFrom="opacity-0"                                                                                                                       
           enterTo="opacity-75"                                                                                                                        
           leave="ease-in duration-200"                                                                                                                
           leaveFrom="opacity-75"                                                                                                                      
           leaveTo="opacity-0"                                                                                                                         
         >                                                                                                                                             
           <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />                                                              
         </TransitionChild>                                                                                                                           
                                                                                                                                                       
         <div className="fixed inset-0 overflow-y-auto">                                                                                               
           <div className="flex min-h-full items-center justify-center p-4 text-center">                                                               
             <TransitionChild                                                                                                                         
               as={Fragment}                                                                                                                           
               enter="ease-out duration-300"                                                                                                           
               enterFrom="opacity-0 scale-95"                                                                                                          
               enterTo="opacity-100 scale-100"                                                                                                         
               leave="ease-in duration-200"                                                                                                            
               leaveFrom="opacity-100 scale-100"                                                                                                       
               leaveTo="opacity-0 scale-95"                                                                                                            
             >                                                                                                                                         
               <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all">         
                 <DialogTitle as="h3" className="text-lg font-semibold text-gray-900">                                                        
                   {title}                                                                                                                             
                 </DialogTitle>                                                                                                                       
                 <div className="mt-4">                                                                                                                
                   {children}                                                                                                                          
                 </div>                                                                                                                                
               </DialogPanel>                                                                                                                         
             </TransitionChild>                                                                                                                       
           </div>                                                                                                                                      
         </div>                                                                                                                                        
       </Dialog>                                                                                                                                       
     </Transition>                                                                                                                                     
   );                                                                                                                                                  
 };                                                                                                                                                    
                                                                                                                                                       
 export default CommonModal;