import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import * as Table from "@radix-ui/themes/dist/cjs/components/table";
import { Avatar, Skeleton } from "@radix-ui/themes";
import { DoubleArrowUpIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const usersDocs = await getDocs(collection(db, "users"));
      const usersData = usersDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort by score descending
      usersData.sort((a, b) => (b.score || 0) - (a.score || 0));
      setUsers(usersData);
      setLoading(false);
    }
    fetchUsers();
  }, []);
  return (
    <div className="p-2 size-full">
      <div className="text-3xl font-[Cal_Sans]">Leaderboard</div>
      <Table.Root className="w-full">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell className="text-2xl">#</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="text-2xl">User</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="text-2xl">Score</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading
            ? [...Array(5)].map((_, i) => (
                <Table.Row key={i}>
                  <Table.RowHeaderCell>
                    <Skeleton className="w-10 h-10 rounded" />
                  </Table.RowHeaderCell>
                  <Table.Cell>
                    <div className="flex items-center gap-4 p-2">
                      <Skeleton className="rounded-full" style={{ width: 48, height: 48 }} />
                      <Skeleton className="w-40 h-8 rounded" />
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Skeleton className="w-20 h-8 rounded" />
                  </Table.Cell>
                </Table.Row>
              ))
            : users.map((user, index) => (
                <Table.Row key={user.id} className="text-2xl font-[Cal_Sans]">
                  <Table.RowHeaderCell>
                    <span className="flex items-center gap-2 h-full">
                      
                      {index + 1}
                    </span>
                  </Table.RowHeaderCell>
                  <Table.Cell>
                    <div onClick={() => navigate(`/profile/${user.id}`)} className="flex hover:bg-ruby-3 rounded-md cursor-pointer items-center gap-4 p-2">
                      <Avatar
                        fallback={
                          user?.firstName?.charAt(0) + user?.lastName?.charAt(0)
                        }
                        radius="full"
                        size="6"
                      />
                      <span>
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="font-bold h-full items-center flex">{user.score || 0}</span>
                  </Table.Cell>
                </Table.Row>
              ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
};

export default Leaderboard;
