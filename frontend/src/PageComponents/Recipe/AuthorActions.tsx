import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { PencilIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import DeleteRecipeDialog from "./DeleteRecipeDialog"

type AuthorActionsProps = {
    postId: string,
    title?: string,
}

// Edit / Delete buttons shown to the author on their own recipe page
const AuthorActions = ({ postId, title }: AuthorActionsProps) => {
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()

    return (
        <div aria-label="author actions" className="flex gap-2 ml-5 mt-3">
            <Button asChild variant={'outline'} size={'sm'}>
                <Link to={`/myrecipe/edit/${postId}`}>
                    <PencilIcon className="mr-2 h-4 w-4" /> Edit recipe
                </Link>
            </Button>
            <Button variant={'outline'} size={'sm'} className="text-destructive" onClick={() => setOpen(true)}>
                <Trash2Icon className="mr-2 h-4 w-4" /> Delete
            </Button>
            <DeleteRecipeDialog
            postId={postId}
            title={title}
            open={open}
            onOpenChange={setOpen}
            onDeleted={() => navigate('/myrecipe/dashboard')} />
        </div>
    )
}

export default AuthorActions
