import { Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "../pages/Dashboard";
import Today from "../pages/Today";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import TodoDetails from "../pages/TodoDetails";
import Todos from "../pages/Todos";
import CreateTodo from "../pages/CreateTodo";
import NotFound from "../pages/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Protected routes — require authentication */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/today" element={<Today />} />
          <Route path="/todos" element={<Todos />} />
          <Route path="/todo/:id" element={<TodoDetails />} />
          <Route path="/create-todo" element={<CreateTodo />} />
        </Route>
      </Route>

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 404 catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;