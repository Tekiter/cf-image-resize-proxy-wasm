/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { PhotonImage, resize } from "./photon_rs_bg";
import loadPhotonWasm from "./photon/loadPhotonWasm";

loadPhotonWasm();

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    try {
      const url = new URL(request.url);

      if (url.pathname === "/") {
        const target = url.searchParams.get("url");

        if (!target) {
          return new Response(null, {
            status: 400,
          });
        }

        const decodedTarget = decodeURIComponent(target);

        const res = await fetch(decodedTarget);
        const receivedBuffer = await res.arrayBuffer();

        const img = PhotonImage.new_from_byteslice(
          new Uint8Array(receivedBuffer)
        );
        // const b64 = arrayBufferToB64(new Uint8Array(receivedBuffer));
        // const img = PhotonImage.new_from_base64(b64);

        const targetWidthStr = url.searchParams.get("w");
        const targetWidth = targetWidthStr
          ? parseInt(targetWidthStr, 10)
          : img.get_width();

        const newHeight = Math.round(
          img.get_height() * (targetWidth / img.get_width())
        );

        // const converted = resize(img, targetWidth, newHeight, 1);
        const converted = img;

        return new Response("haha");

        const base64Img = converted.get_base64().split(",")[1];
        const bytes = b64ToArrayBuffer(base64Img);

        return new Response(bytes, {
          headers: new Headers({
            "Accept-Ranges": "bytes",
            "Content-Type": "image/png",
            "Content-Length": `${bytes.length}`,
          }),
        });
      }

      return new Response(null, {
        status: 404,
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

function arrayBufferToB64(buffer: Uint8Array) {
  return btoa([...buffer].map((val) => String.fromCharCode(val)).join(""));
}

function getResultImageInfo(base64img: string) {}
