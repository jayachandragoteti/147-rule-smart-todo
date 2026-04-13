import GenericTaskListView from "../components/todos/GenericTaskListView";

const Learning = () => {
  return (
    <GenericTaskListView 
      title="Learning Intervals"
      description="Manage your 1-3-7 spaced repetition learning tasks here."
      taskFilter={(t) => !!t.apply137Rule}
    />
  );
};

export default Learning;