export async function safeEval(code: string): Promise<number> {
  let [startTime, endTime] = [0, 0];

  try {
    startTime = performance.now();
    await Function(code)();
  } catch (error) {
    console.error(error);
  } finally {
    endTime = performance.now();
  }

  return parseFloat((endTime - startTime).toFixed(2));
}
