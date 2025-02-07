/** Existing types */
export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface ApiResponse<T> {
    data: T;
    message: string;
    status: number;
  }
  
  /** Add your navigation types */
  export type RootStackParamList = {
    Login: undefined;
    Signup: undefined;
    Home: undefined;
  };
  