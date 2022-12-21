# cf-image-resize-proxy-wasm

- Image Resize Proxy for [Cloudflare Workers](https://workers.cloudflare.com/)
- Use WebAssembly library for image resizing ([photon](https://silvia-odwyer.github.io/photon/))

## Usage

```
https://<your-worker-url>/?url=<image_url>&w=<resized_width_in_pixel>
```

**Example**

```
https://localhost:8787/?url=https://loremflickr.com/1000&w=200
```
