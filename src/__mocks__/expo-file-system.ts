export const documentDirectory = '/tmp/';
export const cacheDirectory = '/tmp/cache/';
export async function getInfoAsync() { return { exists: false, isDirectory: false, size: 0, uri: '' }; }
export async function readAsStringAsync() { return ''; }
export async function writeAsStringAsync() {}
export async function deleteAsync() {}
export async function moveAsync() {}
export async function copyAsync() {}
export async function makeDirectoryAsync() {}
export const EncodingType = { UTF8: 'utf8', Base64: 'base64' };
