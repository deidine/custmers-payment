 import UserAttendancePage from '@/components/dashboard/attendance/UserAttendancePage'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { DashboardCategoryEnum } from '@/lib/dashboard-categories'
import React from 'react'

export default function page({params}:{params:{id:string}}) {
    const actif=DashboardCategoryEnum.ATTENDANCE
  return (
        <DashboardLayout title={"Attendance"} activeSlug={actif}>
    <UserAttendancePage userId={params.id} />
      </DashboardLayout>)
}
