const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
export default async function App() {
  await delay(2000);
  return (
    <h1 className="border border-red-400 text-green-300">
      Hello world! sraiet nisraet eisrtaen
    </h1>
  );
}
