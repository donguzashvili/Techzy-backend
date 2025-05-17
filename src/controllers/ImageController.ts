import { Request, Response } from "express";
import Image from "../models/Image";
import fs from "fs";
import path from "path";
import cloudinary from "@/lib/cloudinary";
import mongoose from "mongoose";

export const createImage = async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    res.status(400).json({ error: "No files uploaded" });
    return;
  }

  try {
    const existingCount = await Image.countDocuments();
    let sortIndex = existingCount;

    const uploadResults = await Promise.all(
      files.map(async (file, idx) => {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "techzy",
          use_filename: true,
          unique_filename: false,
        });

        fs.unlinkSync(file.path); // clean up temp file

        return {
          name: file.originalname,
          url: result.secure_url,
          public_id: result.public_id,
          sortIndex: sortIndex + idx,
        };
      })
    );

    const createdImages = await Image.insertMany(uploadResults);
    res.status(201).json(createdImages);
  } catch (err: any) {
    console.error("Upload / save error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getImages = async (_req: Request, res: Response) => {
  const images = await Image.find().sort({
    sortIndex: 1,
  });

  res.json(images);
};

export const postOrder = async (req: Request, res: Response) => {
  const data: { from: string; to: string } = req.body;

  if (!data || typeof data.from !== "string" || typeof data.to !== "string") {
    res.status(400).json({
      error:
        "imageIds must be an object with 'from' and 'to' string properties",
    });
    return;
  }

  try {
    // 1) Fetch current list sorted by sortIndex
    const images = await Image.find().sort({ sortIndex: 1 });

    // 2) Find indexes
    const fromIndex = images.findIndex(
      (img) => img._id.toString() === data.from
    );
    const toIndex = images.findIndex((img) => img._id.toString() === data.to);

    if (fromIndex === -1 || toIndex === -1) {
      res.status(404).json({ error: "One or both images not found" });
      return;
    }

    // 3) Rearrange the array
    const reordered = [...images];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    // 4) Update sortIndex
    const bulkOps = reordered.map((img, idx) => ({
      updateOne: {
        filter: { _id: img._id },
        update: { $set: { sortIndex: idx } },
      },
    }));

    await Image.bulkWrite(bulkOps);

    // 5) Return updated order
    const orderedImages = await Image.find().sort({ sortIndex: 1 });

    res.json(orderedImages);
  } catch (err: any) {
    console.error("Re-order error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getImage = async (req: Request, res: Response) => {
  const image = await Image.findById(req.params.id);
  if (!image) {
    res.status(404).json({ message: "Not found" });
    return;
  }
  res.json(image);
};

export const updateImage = async (req: Request, res: Response) => {
  const { name } = req.body;
  const updated = await Image.findByIdAndUpdate(
    req.params.id,
    { name },
    { new: true }
  );
  if (!updated) {
    res.status(404).json({ message: "Not found" });
    return;
  }
  res.json(updated);
};

export const deleteImage = async (req: Request, res: Response) => {
  const image = await Image.findByIdAndDelete(req.params.id);
  if (image) {
    const filename = path.basename(image.url);
    const filePath = path.join(__dirname, "..", "..", "uploads", filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  res.json({ message: "Deleted successfully" });
};
