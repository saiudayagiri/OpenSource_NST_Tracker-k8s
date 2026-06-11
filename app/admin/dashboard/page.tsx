import { redirect } from 'next/navigation';
import { checkAdminAuth } from '@/lib/admin-auth';
import { getFlaggedPRs } from '@/lib/flagged';
import { getReviewedPRIds } from '@/lib/reviewed';
import AdminDashboardClient from './AdminDashboardClient';
import { getStudents } from '@/lib/github';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const authed = await checkAdminAuth();
  if (!authed) redirect('/admin');

  const flaggedPRs = getFlaggedPRs();
  const reviewedPRIds = [...getReviewedPRIds()];
  const students = getStudents();

  return (
    <AdminDashboardClient
      flaggedPRs={flaggedPRs}
      reviewedPRIds={reviewedPRIds}
      students={students.map((s) => s.github)}
    />
  );
}
