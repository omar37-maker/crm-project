"use client";

import { useState } from "react";

import { useUsers } from "@/lib/tanstack/useUsers";
import { Pagination } from "@/components/leads/reusable";
import { Button } from "../ui/button";
import UsersTable from "./UsersTable";
import { CreateUserDialog } from "./create-user-dialog";

const PAGE_SIZE = 20;

const UsersPageClient = () => {
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useUsers({
    page,
    pageSize: PAGE_SIZE,
  });

  const users = data?.users ?? [];
  const total = data?.pagination.total ?? 0;
  const pageCount = data?.pagination.pages ?? 0;
  const startItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = total === 0 ? 0 : Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage your users and their roles.
          </p>
        </div>
        <Button onClick={() => setIsCreateUserDialogOpen(true)}>
          + Create User
        </Button>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <UsersTable users={users} />
        {total > 0 && (
          <Pagination
            startItem={startItem}
            endItem={endItem}
            total={total}
            page={page}
            pageCount={pageCount}
            isLoading={isLoading || isFetching}
            setPage={setPage}
            itemLabel="users"
          />
        )}
      </div>
      <CreateUserDialog
        open={isCreateUserDialogOpen}
        onOpenChange={setIsCreateUserDialogOpen}
      />
    </div>
  );
};

export default UsersPageClient;
