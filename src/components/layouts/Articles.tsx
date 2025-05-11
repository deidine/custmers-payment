"use client";

import { articles } from "@/public/articles/articles";

export default function Articles() {
  const itemsToShow = 3;

  return (
    <div className="max-w-6xl mx-auto mt-4">
      <div className={"mb-4 text-center"}>
        <h2 className="text-3xl text-gray-800 font-bold mb-2">
          Articles and Tips
        </h2>
        <h3 className="text-xl text-gray-500">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam,
          aliquid!
        </h3>
      </div>
      <div className="flex flex-col md:flex-row gap-4 relative w-full md:max-h-[600px] overflow-hidden">
        {articles.slice(0, itemsToShow).map((article, index) => (
          <div key={index} className="flex-1 rounded-lg bg-slate-200 p-4">
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="object-cover rounded-lg mx-auto"
              />
            </div>
            <div className="mt-4">
              <h3 className="text-lg text-gray-500 font-bold">
                {article.author}
              </h3>
              <h3 className="text-lg font-bold line-clamp-2">
                {article.title}
              </h3>
              <p className="text-gray-500 line-clamp-5">
                {article.description}
              </p>
            </div>
            <div>
              <a
                href={"#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                Read more
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
