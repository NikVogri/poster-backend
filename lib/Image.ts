import cloudinary from "cloudinary";
import { __test__ } from "../config/environment";

export default class Image {
  static uploadStream(buffer: any, folder: string): Promise<any> | object {
    // if we're testing just return a random link
    if (__test__) {
      return {
        url:
          "https://res.cloudinary.com/cloud/image/upload/v564945/randomimage.jpg",
      };
    }

    return new Promise((resolve, reject) => {
      cloudinary.v2.uploader
        .upload_stream({ folder }, async (err, res) => {
          if (err) {
            reject(err);
          }
          resolve(res);
        })
        .end(buffer);
    });
  }

  static uploadFile(url: string, folder: string) {
    // to do
  }
}
