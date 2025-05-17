import { Router } from "express";
import multer from "multer";
import {
  createImage,
  getImages,
  getImage,
  updateImage,
  deleteImage,
  postOrder,
} from "@/controllers/ImageController";

const router = Router();

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (_req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.post("/", upload.array("image"), createImage);
router.get("/", getImages);
router.get("/:id", getImage);
router.put("/order", postOrder); // specific route
router.put("/:id", updateImage);
router.delete("/:id", deleteImage);

export default router;
