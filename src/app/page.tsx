import PdfUploader from "./input/components/PdfUploader";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 transition-colors dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <header className="space-y-3 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl dark:bg-blue-950">
            📚
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Smart Learning
          </h1>

          <p className="mx-auto max-w-xl text-sm leading-6 text-gray-600 dark:text-gray-400 sm:text-base">
            Turn your PDF documents into interactive quizzes and test your
            knowledge with AI-powered learning.
          </p>
        </header>

        {/* Main Content */}
        <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
          <PdfUploader />
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 dark:text-gray-400">
          Learn at your own pace. Practice, improve, and grow.
        </footer>
      </div>
    </main>
  );
}
