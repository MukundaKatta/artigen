# File uploads

Single source of truth: [`src/services/upload.service.ts`](../src/services/upload.service.ts).

## Pipeline

```
user action (camera, picker, paste, AI gen)
  └─ expo-image-picker / expo-camera produces a local fileUri
       └─ caller invokes uploadFile(bucket, userId, fileUri, fileName)
            ├─ extension allow-list check
            ├─ filename sanitization (strip path traversal / special chars)
            ├─ base64 read via expo-file-system
            ├─ size validation (image: MAX_IMAGE_SIZE_MB, video: MAX_VIDEO_SIZE_MB)
            ├─ supabase.storage.upload(`{userId}/{timestamp}_{name}`, ...)
            └─ supabase.storage.getPublicUrl(path) → returns to caller
```

The caller then writes a DB row that references either the `publicUrl` (e.g. `posts.media_url`) or the path (e.g. `profiles.avatar_url`).

## Buckets

Defined in [`src/lib/constants.ts`](../src/lib/constants.ts):

| Constant key | Bucket name | Purpose | Public? |
|---|---|---|---|
| `avatars` | `avatars` | profile pictures | yes (read) |
| `posts` | `posts` | post media (images / video) | yes (read) |
| `stories` | `stories` | 24h-expiring story media | yes (read) |
| `messages` | `messages` | DM attachments, voice notes, stickers | yes (read; URL is unguessable) |

> **RLS audit pending:** see issue #292 — confirm each bucket's read/write/delete policies match these intents and that messages bucket isn't world-listable.

## Validation contract

`uploadFile` returns `{ url, error }`:
- `url`: signed/public URL on success, else `null`
- `error`: `{ message }` for client-side validation failures (extension / size), or the raw Supabase storage error

| Validation | Behavior on fail |
|---|---|
| Extension not in allow-list | `error: { message: 'File type ".X" is not allowed...' }` |
| Image > `MAX_IMAGE_SIZE_MB` (10MB) | `error: { message: 'File exceeds 10MB size limit' }` |
| Video > `MAX_VIDEO_SIZE_MB` (100MB) | `error: { message: 'File exceeds 100MB size limit' }` |
| Storage rejects (RLS, etc.) | `error: <raw Supabase error>` |

Allowed extensions: `jpg`, `jpeg`, `png`, `gif`, `webp` (images); `mp4`, `mov` (video).

## Path layout

Files are stored under `{userId}/{timestamp}_{sanitizedName}`. The user-id prefix matches the RLS policy pattern (write only to your own folder) and prevents one user from overwriting another's files.

## Sanitization

`fileName.replace(/[^a-zA-Z0-9._-]/g, '_')` — strips path traversal sequences (`..`, `/`) and special characters before storage. Combined with the `{userId}/` prefix this gives defense in depth against bucket escape.

## Downloading AI-generated images

Provider-generated images (Replicate, OpenAI, etc.) return URLs that expire. Call `downloadToLocal(remoteUrl)` to copy the bytes to `FileSystem.cacheDirectory` first, then `uploadFile` from that local path so the final post media lives on our storage.

## Adding a new bucket

1. Add the bucket in Supabase via SQL or dashboard.
2. Add the SELECT/INSERT/UPDATE/DELETE policies — at minimum, allow authenticated INSERT on `{userId}/*` and public SELECT.
3. Add the key to `STORAGE_BUCKETS` in [`src/lib/constants.ts`](../src/lib/constants.ts).
4. Document it in the table above.

## Known gaps (tracked in issues)

- **#289** This doc was previously missing
- **#292** RLS / policy audit on storage buckets
- **#294** No network-aware quality selection (uploads always use the same size)
