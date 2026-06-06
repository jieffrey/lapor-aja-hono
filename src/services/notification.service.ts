import pool from "../database/database"

// ── Types ──

export type NotificationType = "new_report" | "status_update" | "comment" | "points_earned"

export interface CreateNotificationPayload {
    user_id: number
    type: NotificationType
    title: string
    message: string
    report_id?: number | null
    triggered_by?: number | null
}

// ── Core CRUD ──

export const createNotificationService = async (payload: CreateNotificationPayload) => {
    const result = await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, report_id, triggered_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
            payload.user_id,
            payload.type,
            payload.title,
            payload.message,
            payload.report_id ?? null,
            payload.triggered_by ?? null,
        ]
    )
    return result.rows[0]
}

export const getNotificationsByUserService = async (userId: number) => {
    const result = await pool.query(
        `SELECT n.*, u.name AS triggered_by_name
         FROM notifications n
         LEFT JOIN users u ON u.id = n.triggered_by
         WHERE n.user_id = $1
         ORDER BY n.created_at DESC
         LIMIT 50`,
        [userId]
    )
    return result.rows
}

export const getUnreadCountService = async (userId: number) => {
    const result = await pool.query(
        `SELECT COUNT(*) AS count
         FROM notifications
         WHERE user_id = $1 AND read = FALSE`,
        [userId]
    )
    return parseInt(result.rows[0].count, 10)
}

export const markAsReadService = async (id: number, userId: number) => {
    const result = await pool.query(
        `UPDATE notifications
         SET read = TRUE
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [id, userId]
    )
    return result.rows[0]
}

export const markAllAsReadService = async (userId: number) => {
    await pool.query(
        `UPDATE notifications
         SET read = TRUE
         WHERE user_id = $1 AND read = FALSE`,
        [userId]
    )
}

// ── Helpers — dipanggil dari controller lain ──

/**
 * Kirim notif ke semua admin & superadmin
 * Dipanggil saat user buat laporan baru
 */
export const notifyAdmins = async (
    reportId: number,
    reportTitle: string,
    triggeredByUserId: number,
    triggeredByName: string
) => {
    const admins = await pool.query(
        `SELECT id FROM users WHERE role IN ('admin', 'superadmin')`
    )

    const promises = admins.rows.map((admin) =>
        createNotificationService({
            user_id: admin.id,
            type: "new_report",
            title: "Laporan baru masuk",
            message: `${triggeredByName} melaporkan: ${reportTitle}`,
            report_id: reportId,
            triggered_by: triggeredByUserId,
        })
    )

    await Promise.all(promises)
}

/**
 * Kirim notif ke pemilik laporan
 * Dipanggil saat admin update status
 */
export const notifyReportOwner = async (
    reportId: number,
    reportTitle: string,
    ownerId: number,
    newStatus: string,
    adminId: number
) => {
    const STATUS_LABEL: Record<string, string> = {
        "Pending": "Menunggu",
        "In Progress": "Sedang Diproses",
        "Resolved": "Selesai",
        "Rejected": "Ditolak",
    }

    await createNotificationService({
        user_id: ownerId,
        type: "status_update",
        title: "Status laporan diperbarui",
        message: `Laporan "${reportTitle}" diubah ke ${STATUS_LABEL[newStatus] ?? newStatus}`,
        report_id: reportId,
        triggered_by: adminId,
    })
}

/**
 * Kirim notif ke pemilik laporan saat ada komentar baru
 */
export const notifyNewComment = async (
    reportId: number,
    reportTitle: string,
    ownerId: number,
    commenterName: string,
    commenterId: number
) => {
    // Jangan notif diri sendiri
    if (ownerId === commenterId) return

    await createNotificationService({
        user_id: ownerId,
        type: "comment",
        title: "Komentar baru",
        message: `${commenterName} mengomentari "${reportTitle}"`,
        report_id: reportId,
        triggered_by: commenterId,
    })
}

/**
 * Kirim notif poin ke user
 */
export const notifyPointsEarned = async (
    userId: number,
    points: number,
    reason: string
) => {
    await createNotificationService({
        user_id: userId,
        type: "points_earned",
        title: "Poin diterima",
        message: `Kamu mendapat +${points} poin karena ${reason}`,
    })
}