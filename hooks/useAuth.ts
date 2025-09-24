import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { useEffect } from "react";
import { loadStoredUser, logout } from "../store/slices/authSlice";


export function useAuth() {
const dispatch = useDispatch<AppDispatch>();
const auth = useSelector((s: RootState) => s.auth);


useEffect(() => {
dispatch(loadStoredUser() as any);
}, []);


return {
user: auth.user,
loading: auth.isLoading,
error: auth.error,
logout: () => dispatch(logout()),
};
}