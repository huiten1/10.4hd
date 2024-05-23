const streamToJSON = async (readableStream) => {
  const reader = readableStream.getReader();
  const decoder = new TextDecoder();
  let result = "";
  let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    result += decoder.decode(value, { stream: true });
  }

  return JSON.parse(result);
};

const lerp = (a, b, t) => {
  return (1 - t) * a + t * b;
};
