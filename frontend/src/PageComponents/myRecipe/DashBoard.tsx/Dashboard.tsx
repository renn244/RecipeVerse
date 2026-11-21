import DashboardHeader from "./Header"
import PostTable from "./PostTable"
import useDashboard from "./useDashboard.hook"

export type PostDataType = {
  id: string,
  recipe: {
    title: string
  },
  status: string,
  views: number,
  likes: number,
  favorites: number,
  _count: {
    comments: number,
  }
  createdAt: Date
}


const Dashboard = () => {
  
  const { post, page, totalPages, getpostDashboard } = useDashboard()

  return (
    <div>
      <h1 className="ml-12 mb-5 font-bold text-5xl">DashBoard</h1>
      <div className="flex flex-col gap-[2rem]">
        <DashboardHeader />
        <PostTable
        posts={post}
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => getpostDashboard(p)}
        onDeleted={() => getpostDashboard(page)} />
      </div>
    </div>
  )
}

export default Dashboard