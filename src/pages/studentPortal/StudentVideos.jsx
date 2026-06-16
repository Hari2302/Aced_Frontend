import { useMemo } from "react";
import { useStudentPortalData } from "../../hooks/useStudentPortalData";

const StudentVideos = () => {
  const { loading, error, data } = useStudentPortalData();
  const timetable = Array.isArray(data?.timetable) ? data.timetable : [];

  const videos = useMemo(() => {
    const uniqueSubjects = Array.from(
      new Set(
        timetable
          .map((item) => (item.Subject || item.subject || "").trim())
          .values(),
      ),
    ).filter(Boolean);

    return uniqueSubjects.map((subject, index) => ({
      id: `${subject}-${index}`,
      title: `${subject} - Online Class Video`,
      duration: `${20 + (index % 4) * 10} mins`,
      level: index % 2 === 0 ? "Foundation" : "Revision",
    }));
  }, [timetable]);

  return (
    <main>
      <div className="admin-card p-5 md:p-6 mb-6">
        <h1 className="admin-title text-2xl font-bold text-emerald-900">
          Video Section
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Subject-wise online class video library.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-600 mb-4">Loading videos...</p>
      ) : null}
      {error ? (
        <p className="admin-card p-4 text-sm text-red-700 mb-4" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {videos.length === 0 ? (
            <div className="admin-card p-5 text-slate-500">
              No video lessons available yet.
            </div>
          ) : (
            videos.map((video) => (
              <div key={video.id} className="admin-card p-5">
                <div className="h-36 rounded-lg bg-gradient-to-br from-emerald-600 to-cyan-700 mb-4 flex items-center justify-center text-white font-semibold">
                  Demo Video
                </div>
                <h2 className="font-semibold text-slate-800">{video.title}</h2>
                <p className="text-sm text-slate-500 mt-1">{video.duration}</p>
                <p className="text-xs text-emerald-700 font-semibold mt-2">
                  {video.level}
                </p>
              </div>
            ))
          )}
        </div>
      ) : null}
    </main>
  );
};

export default StudentVideos;
