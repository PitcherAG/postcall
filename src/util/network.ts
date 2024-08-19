export async function urlSafeFetchInChunks<T>(
  ids: (string | number)[],
  fetchFunction: (
    chunk: (string | number)[],
  ) => Promise<{ results: T[] } | T[]>,
  options: { chunkSize: number } = { chunkSize: 100 },
): Promise<T[]> {
  const idChunks: (string | number)[][] = []
  const { chunkSize } = options
  for (let i = 0; i < ids.length; i += chunkSize) {
    idChunks.push(ids.slice(i, i + chunkSize))
  }

  const fetchPromises = idChunks.map((chunk) => fetchFunction(chunk))
  const results = await Promise.all(fetchPromises)
  return results.flatMap((res) => (Array.isArray(res) ? res : res.results))
}
