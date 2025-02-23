import { User } from '../user/user.entity'; // Upewnij się, że ścieżka jest poprawna                    
                                                                                                         
declare module 'express' {                                                                              
  export interface Request {                                                                            
    user?: User; // Dodaje właściwość user do Request                                                   
  }                                                                                                     
}