import { getSession } from "@/lib/auth";
import { ok, unauthorized, serverError } from "@/lib/response";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      checkedInToday,
      checkedOutToday,
      totalChildren,
      activeStaff,
      upcomingEvents,
    ] = await prisma.$transaction([
      prisma.attendanceLog.count({
        where: { status: "CHECKED_IN", check_in_time: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.attendanceLog.count({
        where: { status: "CHECKED_OUT", check_in_time: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.child.count({ where: { is_active: true } }),
      prisma.staffUser.count({ where: { account_status: "ACTIVE" } }),
      prisma.event.count({ where: { status: { in: ["UPCOMING", "ONGOING"] } } }),
    ]);

    return ok({
      checked_in_today:   checkedInToday,
      checked_out_today:  checkedOutToday,
      total_children:     totalChildren,
      active_staff:       activeStaff,
      upcoming_events:    upcomingEvents,
      duty_manager: {
        staff_id:         session.staff_id,
        full_name:        session.full_name,
        role_name:        session.role_name,
        permission_level: session.permission_level,
      },
    });
  } catch (e) {
    return serverError(e);
  }
}
