import { useParams } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import type { Todo } from "../types/todo";

const mockTodo: Todo | null = null;

const TodoDetails = () => {
  const { id } = useParams();

  if (!mockTodo) {
    return (
      <PageWrapper>
        <div className="text-gray-500 dark:text-gray-400">
          Task not found (ID: {id})
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f2937] rounded-2xl overflow-hidden">

        {mockTodo.posterImage && (
          <img
            src={mockTodo.posterImage}
            alt={mockTodo.title}
            className="w-full h-64 object-cover"
          />
        )}

        <div className="p-8 space-y-6">

          <h2 className="text-2xl font-semibold">
            {mockTodo.title}
          </h2>

          {/* Status + 147 */}
          <div className="flex gap-3 text-sm">
            <span>{mockTodo.status}</span>
            <span>{mockTodo.actionType}</span>
            {mockTodo.apply147Rule && <span>147 Rule Active</span>}
          </div>

          {/* Descriptions */}
          <div className="space-y-4">
            {mockTodo.descriptions.map((desc, index) => (
              <p key={index} className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {desc}
              </p>
            ))}
          </div>

          {/* Links */}
          {mockTodo.links.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">References</h3>
              {mockTodo.links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  {link.title}
                </a>
              ))}
            </div>
          )}

          {/* Gallery */}
          {mockTodo.galleryImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {mockTodo.galleryImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt="gallery"
                  className="rounded-lg object-cover h-32 w-full"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default TodoDetails;