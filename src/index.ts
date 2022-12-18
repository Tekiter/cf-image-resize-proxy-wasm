import { PhotonImage, resize } from "./photon/photon_rs_bg";
import loadPhotonWasm from "./photon/loadPhotonWasm";

loadPhotonWasm();

export interface Env {}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    try {
      const url = new URL(request.url);

      if (url.pathname !== "/") {
        return new Response(null, {
          status: 404,
        });
      }

      const target = url.searchParams.get("url");
      const targetWidthStr = url.searchParams.get("w");
      const targetWidth = targetWidthStr ? parseInt(targetWidthStr, 10) : null;

      if (!target || !targetWidth) {
        return new Response(null, {
          status: 400,
        });
      }

      const decodedTarget = decodeURIComponent(target);
      const receivedBuffer = await fetchBytes(decodedTarget);
      const resizedImageBytes = resizeImage(receivedBuffer, targetWidth);

      return new Response(resizedImageBytes, {
        headers: new Headers({
          "Accept-Ranges": "bytes",
          "Content-Type": "image/png",
          "Content-Length": `${resizedImageBytes.length}`,
        }),
      });
    } catch (err) {
      console.error(err);
      return new Response(null, {
        status: 500,
      });
    }
  },
};

function b64ToArrayBuffer(base64: string) {
  return new Uint8Array([...atob(base64)].map((c) => c.charCodeAt(0)));
}

async function fetchBytes(url: string) {
  const res = await fetch(url);
  const receivedBuffer = await res.arrayBuffer();

  return receivedBuffer;
}

function resizeImage(imageBuffer: ArrayBuffer, newWidth: number) {
  const img = PhotonImage.new_from_byteslice(new Uint8Array(imageBuffer));
  const newHeight = Math.round(img.get_height() * (newWidth / img.get_width()));
  const converted = resize(img, newWidth, newHeight, 1);
  const base64Img = converted.get_base64().split(",")[1];
  const imageBytes = b64ToArrayBuffer(base64Img);

  return imageBytes;
}
