export default function isES2020Supported() {
  return typeof globalThis !== 'undefined';
}
