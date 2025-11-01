// convert file to base64

export function convertBase64(file: File | string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file || typeof file === "string") {
      if (file.startsWith("data:") || file.startsWith("http")) {
        resolve(file); // Return the base64 string directly
        return;
      }
      resolve("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// convert base64 to file

export async function convertBase64ToFile(
  base64: string | null
): Promise<File> {
  if (!base64) {
    const fallbackType = "image/jpeg";
    return new File([], "file", { type: fallbackType });
  }
  const res = await fetch(base64);
  const blob = await res.blob();
  return new File([blob], "file", { type: blob.type });
}

export async function convertBase64ToBuffer(
  base64: string | null
): Promise<Buffer> {
  if (!base64) return Buffer.from([]);
  const res = await fetch(base64);
  const blob = await res.blob();
  return Buffer.from(await blob.arrayBuffer());
}
