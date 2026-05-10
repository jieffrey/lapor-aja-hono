import { Context } from "hono";
import {
    createReportService,
    getReportService,
    updateReportService,
    deleteReportService,
    getReportByIdService
}
    from "../services/report.service";
import { CpuInfo } from "node:os";

export const createReport = async (c: Context) => {
    try {
        const body = await c.req.json()

        const payload = c.get(
            "jwtPayload"
        ) as {
            id: number,
            role: string
        }

        const report = await createReportService(
            String(payload.id),
            body.title,
            body.description,
            body.category
        )
        return c.json(
            {
                success: true,
                message: "Report Created",
                data: report
            }, 201
        )
    } catch (error) {
        return c.json(
            {
                success: false,
                message: "Failed Create Report!", error
            }, 500
        )
    }
}

export const getReports = async (c: Context) => {
    try {
        const reports = await getReportService()

        return c.json(
            {
                success: true,
                data: reports
            }, 200
        )
    } catch (error) {
        return c.json(
            {
                success: false,
                error
            }, 500
        )
    }
}

export const getReportById = async (c: Context) => {
    try {
        const id =
            c.req.param("id")

        if (!id) {
            return c.json(
                {
                    success: false,
                    message: "Missing id parameter"
                }, 400
            )
        }

        const report = await getReportByIdService(id)

        return c.json({
            success: true,
            data: report
        })
    } catch (error) {
        return c.json(
            {
                success: false,
                error
            },
            500
        )
    }
    }

export const updateReport = async (c: Context) => {
    try {
        const id = c.req.param("id")

        if (!id) {
            return c.json(
                {
                    success: false,
                    message: "Missing id parameter"
                }, 400
            )
        }

        const body = await c.req.json()

        const report = await updateReportService(
            id,
            body.title,
            body.description,
            body.category
        )

        return c.json(
            {
                success: true,
                message: "Report Updated", data: report
            }, 200
        )
    } catch (error) {
        return c.json(
            {
                success: false,
                message: "Failed Update Report!", error
            }, 500
        )
    }
}

export const deleteReport = async (c: Context) => {
    try {
        const id = c.req.param("id")

        if (!id) {
            return c.json(
                {
                    success: false,
                    message: "Missing id parameter"
                }, 400
            )
        }

        await deleteReportService(id)

        return c.json(
            {
                success: true,
                message: "Report Deleted!"
            }, 200
        )
    } catch (error) {
        return c.json(
            {
                success: false,
                error
            }, 500
        )
    }
}