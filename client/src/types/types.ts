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
    login: undefined;
    signup: undefined;
    home: undefined;
    scan: {qrCode: string};
    class: undefined;
    analytics: undefined;
    setting: undefined;
  };
  