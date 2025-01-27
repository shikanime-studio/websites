export default function Wip() {
  return (
    <div className="flex flex-col items-center gap-5">
      <p className="text-4xl font-bold">This part is still in development</p>
      <img
        className="rounded"
        src="/work-in-progress.gif"
        alt="Work in progress animation"
        width={540}
        height={470}
      />
    </div>
  );
}
