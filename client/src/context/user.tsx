import React, { createContext, useContext, useState, ReactNode} from 'react';


// THIS FILE STORES USER DATA OF THE CURRENT USER LOGGED IN FOR THE WHOLE SESSION
// IDEALLY THE SESSION SHOULD LAST AS LONG AS THE COOKIE IS STILL THERE, OTHERWISE, ERASE AND BACK TO LOGIN SCREEN
// AS MORE FEATURES ARE ADDED, THIS FILE WILL BE UPDATED TO STORE MORE DATA FOR USER

interface User{
    id: number;
    first_name: string;
    last_name: string; 
    email: string;
    role: string;
}

interface UserContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (context === undefined) { throw new Error('useUserContext must be used within a UserProvider'); }
    return context;
};