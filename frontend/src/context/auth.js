import {redirect} from 'react-router-dom';

export function getTokens(){
    const token = localStorage.getItem('accessToken');
    return token;
}
export function checkAuthLoader(){
 const token= getTokens();

 if (!token){
    return redirect("/");
 }
}