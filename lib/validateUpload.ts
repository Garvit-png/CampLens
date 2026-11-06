
export const MAX_FILE_SIZE_MB = 5;

export const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

export function validateUpload(file: File): string | null {

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return "Only JPEG, PNG and WEBP images are allowed";
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        return "File size must be less than 5 MB";
    }

    return null;
}
