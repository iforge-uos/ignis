import Title from '@/components/title';
import { getMailingLists } from '@/services/notifications/getMailingLists';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'

const NotificationDashboard = () => {
    const {
    data: lists,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["mailing-lists"],
    queryFn: () => getMailingLists(),
    staleTime: 600_000,
    refetchInterval: 900_000,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  console.log(lists);

  return (
    <>
      <div className="p-4 mt-1">
        <Title prompt="Notification Dashboard" />
      </div>
    </>
  );
};


export const Route = createFileRoute('/_authenticated/admin/notifications/dashboard')({
  component: NotificationDashboard
})