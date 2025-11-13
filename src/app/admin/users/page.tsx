
import UserTable from './UserTable'
import { getUsers } from '@/lib/services/users/get'

export default async function UserPage() {
  const users = await getUsers();
  return (
    <section>
      <UserTable users={users} />
    </section>
  )
}
