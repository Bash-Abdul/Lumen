// import { v2 as cloudinary } from 'cloudinary';

// // Configure Cloudinary with environment variables
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // export interface UploadResult {
// //   url: string;
// //   thumbUrl: string;
// //   publicId: string;
// //   width: number;
// //   height: number;
// //   format: string;
// // }

// /**
//  * Upload an image to Cloudinary
//  * Automatically generates a thumbnail version
//  */
// export async function uploadImage(
//   file: File,
//   folder: string = 'photos'
// ): Promise<UploadResult> {
//   try {
//     // Convert File to base64 for upload
//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);
//     const base64 = buffer.toString('base64');
//     const dataUri = `data:${file.type};base64,${base64}`;

//     // Upload to Cloudinary
//     const result = await cloudinary.uploader.upload(dataUri, {
//       folder,
//       resource_type: 'image',
//       transformation: [
//         { quality: 'auto:good' }, // Automatic quality optimization
//         { fetch_format: 'auto' }, // Automatic format selection (WebP, AVIF, etc.)
//       ],
//     });

//     // Generate thumbnail URL using Cloudinary transformations
//     const thumbUrl = cloudinary.url(result.public_id, {
//       transformation: [
//         { width: 400, crop: 'limit' }, // Max width 400px, maintain aspect ratio
//         { quality: 'auto:good' },
//         { fetch_format: 'auto' },
//       ],
//     });

//     return {
//       url: result.secure_url,
//       thumbUrl,
//       publicId: result.public_id,
//       width: result.width,
//       height: result.height,
//       format: result.format,
//     };
//   } catch (error) {
//     console.error('Cloudinary upload error:', error);
//     throw new Error('Failed to upload image');
//   }
// }

// /**
//  * Delete an image from Cloudinary
//  */
// export async function deleteImage(publicId: string): Promise<void> {
//   try {
//     await cloudinary.uploader.destroy(publicId);
//   } catch (error) {
//     console.error('Cloudinary delete error:', error);
//     throw new Error('Failed to delete image');
//   }
// }

// /**
//  * Generate a thumbnail URL for an existing Cloudinary image
//  */
// export function getThumbnailUrl(publicId: string, width: number = 400): string {
//   return cloudinary.url(publicId, {
//     transformation: [
//       { width, crop: 'limit' },
//       { quality: 'auto:good' },
//       { fetch_format: 'auto' },
//     ],
//   });
// }

// export default cloudinary;

import "server-only";


import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an image to Cloudinary
 * Automatically generates a thumbnail version
 * @param {File} file - Browser File object
 * @param {string} [folder='photos'] - Cloudinary folder
 * @returns {Promise<{
 *   url: string;
 *   thumbUrl: string;
 *   publicId: string;
 *   width: number;
 *   height: number;
 *   format: string;
 * }>}
 */
export async function uploadImage(file, folder = "photos") {
  try {
    // Convert File to base64 for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: "image",
      transformation: [
        { quality: "auto:good" }, // Automatic quality optimization
        { fetch_format: "auto" }, // Automatic format selection (WebP, AVIF, etc.)
      ],
    });

    // Generate thumbnail URL using Cloudinary transformations
    const thumbUrl = cloudinary.url(result.public_id, {
      transformation: [
        { width: 400, crop: "limit" }, // Max width 400px, maintain aspect ratio
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
    });

    return {
      url: result.secure_url,
      thumbUrl,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image");
  }
}

/**
 * Delete an image from Cloudinary
 * @param {string} publicId
 * @returns {Promise<void>}
 */
export async function deleteImage(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete image");
  }
}

/**
 * Generate a thumbnail URL for an existing Cloudinary image
 * @param {string} publicId
 * @param {number} [width=400]
 * @returns {string}
 */
export function getThumbnailUrl(publicId, width = 400) {
  return cloudinary.url(publicId, {
    transformation: [
      { width, crop: "limit" },
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ],
  });
}

export default cloudinary;
