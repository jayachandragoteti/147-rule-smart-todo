import { Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Dashboard from "../pages/Dashboard";
import Today from "../pages/Today";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import TodoDetails from "../pages/TodoDetails";
import Todos from "../pages/Todos";
import CreateTodo from "../pages/CreateTodo";
// import ProtectedRoute from "./ProtectedRoute";


const AppRoutes = () => {
  return (
    <Routes>
      {/* <ProtectedRoute> */}
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/today" element={<Today />} />
          <Route path="/todos" element={<Todos />} />
          <Route path="/todo/:id" element={<TodoDetails />} />
          {/* <Route path="/learning" element={<Learning />} /> */}
          <Route path="/create-todo" element={<CreateTodo />} />
        </Route>
      {/* </ProtectedRoute> */}

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default AppRoutes;