import { useAppDispatch, useAppSelector } from "./app/hooks";
import { toggleSidebar } from "./features/ui/uiSlice";

function App() {
  const dispatch = useAppDispatch();
  const isSidebarOpen = useAppSelector((state) => state.ui.isSidebarOpen);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">147RuleSmartTodo</h1>

      <button
        onClick={() => dispatch(toggleSidebar())}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Toggle Sidebar
      </button>

      <p className="mt-2">
        Sidebar Status: {isSidebarOpen ? "Open" : "Closed"}
      </p>
    </div>
  );
}

export default App;
