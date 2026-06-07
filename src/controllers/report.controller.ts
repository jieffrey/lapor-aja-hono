import { Context } from "hono";
import {
  createReportService,
  getReportService,
  updateReportService,
  deleteReportService,
  getReportByIdService,
  updateReportStatusService,
} from "../services/report.service";
import cloudinary from "../utils/cloudinary";
import {
  notifyAdmins,
  notifyReportOwner,
  notifyPointsEarned,
} from "../services/notification.service";
import { addPointsService } from "../services/user.service";

export const createReport = async (c: Context) => {
  try {
    const formData = await c.req.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const priority = formData.get("priority") as string;
    const latitude = formData.get("latitude") as string;
    const longitude = formData.get("longitude") as string;

    const payload = c.get("jwtPayload") as { id: number; role: string };

    // Handle multiple images
    const files = formData.getAll("images") as File[];
    const imageUrls: string[] = [];

    for (const file of files) {
      if (file && file.size > 0) {
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const dataUri = `data:${file.type};base64,${base64}`;

        const uploaded = await cloudinary.uploader.upload(dataUri, {
          folder: "laporaja/reports",
        });
        imageUrls.push(uploaded.secure_url);
      }
    }

    if (imageUrls.length === 0) {
      return c.json(
        { success: false, message: "Minimal 1 foto diperlukan" },
        400,
      );
    }

    const report = await createReportService(
      String(payload.id),
      title,
      description,
      category,
      priority,
      latitude,
      longitude,
      imageUrls[0],
      imageUrls,
    );
    await addPointsService(payload.id, 10);

    // Notify admins
    await notifyAdmins(report.id, title, payload.id, report.name ?? "Pengguna");

    return c.json(
      { success: true, message: "Report Created", data: report },
      201,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return c.json(
      { success: false, message: "Failed Create Report!", error: message },
      500,
    );
  }
};

export const getReports = async (c: Context) => {
  try {
    const reports = await getReportService();

    return c.json(
      {
        success: true,
        data: reports,
      },
      200,
    );
  } catch (error) {
    return c.json(
      {
        success: false,
        error,
      },
      500,
    );
  }
};

export const getReportById = async (c: Context) => {
  try {
    const id = c.req.param("id");

    if (!id) {
      return c.json(
        {
          success: false,
          message: "Missing id parameter",
        },
        400,
      );
    }

    const report = await getReportByIdService(id);

    return c.json({
      success: true,
      data: report,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error,
      },
      500,
    );
  }
};

export const updateReport = async (c: Context) => {
  try {
    const id = c.req.param("id");

    if (!id) {
      return c.json(
        {
          success: false,
          message: "Missing id parameter",
        },
        400,
      );
    }

    const body = await c.req.json();

    const report = await updateReportService(
      id,
      body.title,
      body.description,
      body.category,
      body.priority,
      body.image_before,
    );

    return c.json(
      {
        success: true,
        message: "Report Updated",
        data: report,
      },
      200,
    );
  } catch (error) {
    console.error("UPDATE ERROR:", error);

    return c.json(
      {
        success: false,
        message: "Failed Update Report!",
        error: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
};

export const updateReportStatus = async (c: Context) => {
  try {
    console.log("UPDATE REPORT MASUK");
    const id = c.req.param("id");
    console.log("REPORT ID:", id);

    if (!id) {
      return c.json(
        {
          success: false,
          message: "Missing id parameter",
        },
        400,
      );
    }

    const body = await c.req.json();
    const payload = c.get("jwtPayload") as { id: number; role: string };
    const report = await updateReportStatusService(id, body.status);

    if (body.status === "Resolved") {
      await notifyPointsEarned(report.user_id, 25, "laporan selesai ditangani");
    }

    if (body.status === "In Progress") {
      await addPointsService(report.user_id, 5);
      await notifyPointsEarned(report.user_id, 5, "laporan sedang diproses");
    }
    if (body.status === "Resolved") {
      await addPointsService(report.user_id, 25);
      await notifyPointsEarned(report.user_id, 25, "laporan selesai ditangani");
    }

    await notifyReportOwner(
      report.id,
      report.title,
      report.user_id,
      body.status,
      payload.id,
    );

    return c.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error(error);

    return c.json(
      {
        success: false,
        message: "Failed update status",
      },
      500,
    );
  }
};

export const deleteReport = async (c: Context) => {
  try {
    const id = c.req.param("id");

    if (!id) {
      return c.json(
        {
          success: false,
          message: "Missing id parameter",
        },
        400,
      );
    }

    await deleteReportService(id);

    return c.json(
      {
        success: true,
        message: "Report Deleted!",
      },
      200,
    );
  } catch (error) {
    return c.json(
      {
        success: false,
        error,
      },
      500,
    );
  }
};
