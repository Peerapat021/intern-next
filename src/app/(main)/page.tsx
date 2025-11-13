import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function HomePage() {
  const session = await getServerSession(authOptions)


  return (
    <div>
      {session ? (
        <div>
          <p>ยินดีต้อนรับครับ </p>
        </div>
      ) : (
        <div>
          <p>กรุณาเข้าสู่ระบบ</p>
        </div>
      )}
    </div>
  )
}
