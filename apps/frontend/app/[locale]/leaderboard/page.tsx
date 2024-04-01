import backendClient from "@lib/backend-client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/components/ui/table";

export default async function LeaderBoard() {
  const { data: users } = await backendClient.get<
    { publicKey: string; points: number }[]
  >("/users/user-points");

  console.log({ users });
  return (
    <>
      <h1 className="text-center mt-10 text-3xl font-medium mb-8">
        Leaderboard
      </h1>
      <Table>
        <TableCaption>A list of users.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Position</TableHead>
            <TableHead>User PK</TableHead>
            <TableHead>Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u, index) => (
            <TableRow key={u.publicKey}>
              <TableCell className="w-12 text-center">{index + 1}</TableCell>
              <TableCell>{u.publicKey}</TableCell>
              <TableCell>{u.points}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
