import GenericTaskListView from "../components/todos/GenericTaskListView";

const Todos = () => {
  return (
    <GenericTaskListView 
      title="All Tasks"
      description="Browse, filter, and manage all your tasks in one place."
      taskFilter={(t) => !t.apply137Rule}
    />
  );
};

export default Todos;