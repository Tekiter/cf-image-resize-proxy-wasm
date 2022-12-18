import wasm from "./photon.wasm";
import * as photon from "./photon_rs_bg";

const loadPhotonWasm = () => {
  const instance = new WebAssembly.Instance(wasm, {
    "./photon_rs_bg.js": photon as any,
  });
  photon.setWasm(instance.exports);
};

export default loadPhotonWasm;
