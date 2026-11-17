"use client";

import { useParams, useRouter } from "next/navigation";

export default function PhotoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const photoId = params.id as string;

  const photo = {
    id: photoId,
    image_url: "https://picsum.photos/800/600?random=42",
    caption:
      "Freshers night 2024! Best memories 🎉 #Damru26 #IITD #Freshers2024",
    uploaded_at: "2024-01-15T18:30:00Z",
    uploader_name: "Garvit Sharma",
    event_name: "Freshers Night 2024",
    tags: ["Damru26", "IITD", "Freshers2024"],
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <button
          onClick={() => router.back()}
          className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors"
        >
          ← Wapas jao
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-gray-800 rounded-2xl overflow-hidden">
          <img
            src={photo.image_url}
            alt={photo.caption || "Photo"}
            className="w-full max-h-[70vh] object-contain"
          />
        </div>

        <div className="mt-6 bg-white rounded-2xl p-6">
          {photo.caption && (
            <p className="text-gray-800 text-lg mb-4">{photo.caption}</p>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {photo.tags.map((tag) => (
              <span
                key={tag}
                className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:bg-indigo-200 transition-colors"
                onClick={() => router.push(`/search?tag=${tag}`)}
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 text-gray-500 text-sm border-t border-gray-100 pt-4">
            <span>👤 {photo.uploader_name}</span>
            {photo.event_name && <span>🎉 {photo.event_name}</span>}
            <span>
              📅 {new Date(photo.uploaded_at).toLocaleDateString("hi-IN")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
