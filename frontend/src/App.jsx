import { useState } from "react";
import { ImageUpload } from "./Upload";

function App() {
  const [classificationResult, setClassificationResult] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const [isClassifying, setIsClassifying] = useState(false);

  const handleReset = () => {
    setClassificationResult(null);
    setUploadedImageUrl(null);
    setResetKey((prev) => prev + 1);
  };

  const handleUploadComplete = async (imageUrl) => {
    setUploadedImageUrl(imageUrl);

    try {
      setIsClassifying(true);

      const res = await fetch("http://localhost:5000/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: imageUrl }),
      });

      const data = await res.json();
      setIsClassifying(false);
      setClassificationResult(data);

    } catch (err) {
      console.error("Classification error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex flex-col">
      {/* ---- Header ---- */}
      <header className="sticky top-0 z-99 bg-white/60 backdrop-blur-lg shadow-sm py-4 px-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          👖 Clothing AI
        </h1>
      </header>

      {/* ---- Main Content ---- */}
      <main className="container mx-auto flex-1 py-4">
        {/* Title */}
        <section className="text-center mb-4">
          <h2 className="text-5xl font-bold text-gray-800 drop-shadow-sm">
            AI Clothing Classifier
          </h2>
          <p className="text-gray-700 text-lg mt-2">
            Upload any clothing image and let AI detect whether it is a{" "}
            <span className="font-medium text-indigo-700">Male</span> or{" "}
            <span className="font-medium text-pink-700">Female</span> outfit.
          </p>
        </section>

        {/* Content section */}
        <section className="flex flex-col md:flex-row gap-10 justify-center">
          {/* Upload Panel */}
          <div className="flex-1 max-w-lg bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/40">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Upload Clothing Image
            </h3>

            <ImageUpload
              onUploadComplete={handleUploadComplete}
              resetTrigger={resetKey}
            />

            <div className="flex justify-end mt-6">
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-md"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Result Panel */}
          <div className="flex-1 max-w-lg bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/40">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Classification Result
            </h3>

            {/* Loader */}
            {isClassifying && (
              <div className="flex flex-col items-center py-16">
                <div className="w-20 h-20 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                <p className="text-indigo-600 font-medium mt-4 text-lg animate-pulse">
                  Analyzing image...
                </p>
              </div>
            )}

            {/* Image Preview */}
            {!isClassifying && uploadedImageUrl && (
              <div className="mb-6">
                <img
                  src={uploadedImageUrl}
                  alt="Uploaded"
                  className="rounded-xl shadow-md w-full object-cover"
                />
              </div>
            )}

            {/* Classification data */}
            {!isClassifying && classificationResult ? (
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-inner space-y-4 border border-indigo-100">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-gray-700">Success:</span>
                  <span>{classificationResult.success ? "✔️ Yes" : "❌ No"}</span>
                </div>

                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-gray-700">Class:</span>
                  <span className="font-bold text-indigo-700">
                    {classificationResult.prediction}
                  </span>
                </div>

                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-gray-700">Confidence:</span>
                  <span className="font-bold text-green-700">
                    {classificationResult.confidence}%
                  </span>
                </div>

                {classificationResult.error && (
                  <p className="text-red-600">
                    <strong>Error:</strong> {classificationResult.error}
                  </p>
                )}
              </div>
            ) : (
              !isClassifying && (
                <p className="text-gray-500 italic text-center mt-8">
                  Upload an image to see the result
                </p>
              )
            )}
          </div>
        </section>
      </main>

      {/* ---- Footer ---- */}
      <footer className="text-center py-6 text-gray-700 text-sm">
        © {new Date().getFullYear()} Clothing AI — All Rights Reserved.
      </footer>
    </div>
  );
}

export default App;
