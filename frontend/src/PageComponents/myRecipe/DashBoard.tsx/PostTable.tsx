import { useState } from "react"
import { Link } from "react-router-dom"
import { format } from "date-fns"
import { PostDataType } from "./Dashboard"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card"
import { HeartIcon, MessageSquareIcon, EyeIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon, ExternalLinkIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import PaginationNav from "@/PageComponents/explore/Pagination"
import DeleteRecipeDialog from "@/PageComponents/Recipe/DeleteRecipeDialog"

type PostTableProps = {
    posts: PostDataType[],
    page: number,
    totalPages: number,
    onPageChange: (page: number) => void,
    onDeleted: () => void,
}

const PostTable = ({
    posts,
    page,
    totalPages,
    onPageChange,
    onDeleted
} : PostTableProps) => {
  const [toDelete, setToDelete] = useState<PostDataType | null>(null)

  return (
    <Card>
        <CardHeader className="px-8">
            <CardTitle>Posts</CardTitle>
            <CardDescription>Contains all the post you have</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="min-h-[200px]">
                <Table>
                    <TableCaption>Post Stats</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-xl py-2 w-[600px]">Title</TableHead>
                            <TableHead className="text-xl">Stats</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {posts.map((post) => (
                            <TableRow key={post.id}>

                                <TableCell>
                                    <div>
                                        <h2 className="font-bold text-lg ">{post.recipe.title}</h2>
                                        <CardDescription>Publish: {format(new Date(post.createdAt), 'MM-dd-yyyy')}</CardDescription>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    {
                                        post.status === 'draft' ?
                                            <Badge className="text-base ml-5">{post.status}</Badge>
                                        :
                                        <div className="h-[55px] flex gap-4 items-center">
                                            <div title="likes"
                                            className="flex flex-col items-center">
                                                <HeartIcon />
                                                {post.likes}
                                            </div>
                                            <div title="comments"
                                            className="flex flex-col items-center">
                                                <MessageSquareIcon />
                                                {post._count.comments}
                                            </div>
                                            <div title="views"
                                            className="flex flex-col items-center">
                                                <EyeIcon />
                                                {post.views}
                                            </div>
                                        </div>
                                    }
                                </TableCell>

                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant={'ghost'} aria-label="recipe actions">
                                                <MoreHorizontalIcon />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side={'right'} align="start" className="w-40 px-2">
                                            <DropdownMenuLabel>Recipe</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {post.status === 'post' && (
                                                <DropdownMenuItem asChild>
                                                    <Link to={`/recipe/${post.id}`}>
                                                        <ExternalLinkIcon className="mr-3 h-5 w-5" />
                                                        <span className="text-base font-medium">View</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem asChild>
                                                <Link to={`/myrecipe/edit/${post.id}`}>
                                                    <PencilIcon className="mr-3 h-5 w-5" />
                                                    <span className="text-base font-medium">Edit</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                            className="text-destructive"
                                            onSelect={() => setToDelete(post)}>
                                                <Trash2Icon className="mr-3 h-5 w-5" />
                                                <span className="text-base font-medium">Delete</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>

                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="mt-4">
                <PaginationNav page={page} totalPages={totalPages} onPageChange={onPageChange} />
            </div>
            <DeleteRecipeDialog
            postId={toDelete?.id ?? null}
            title={toDelete?.recipe.title}
            open={!!toDelete}
            onOpenChange={(open) => !open && setToDelete(null)}
            onDeleted={onDeleted} />
        </CardContent>
    </Card>
  )
}

export default PostTable
