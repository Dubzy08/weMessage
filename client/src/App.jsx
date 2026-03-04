import { Route, Routes } from "react-router-dom";
import Header from "./pages/header/Header.jsx";
import Login from "./pages/auth/Login.jsx";
import Signup from "./pages/auth/Signup.jsx";
import Messenger from "./pages/dashboard/Messenger.jsx";

function App() {
    return (
        <>
            <Header></Header>
            <Routes>
                <Route path='/'></Route>
                <Route path='/login' element={<Login></Login>}></Route>
                <Route path='/register' element={<Signup></Signup>}></Route>
                <Route path='/messenger' element={<Messenger></Messenger>}></Route>
            </Routes>
        </>
    );
}

export default App;
