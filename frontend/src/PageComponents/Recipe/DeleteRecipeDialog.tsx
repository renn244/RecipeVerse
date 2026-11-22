import { useState } from "react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { API_URL } from '@/lib/api'

type DeleteRecipeDialogProps = {
    postId: string | null,
    title?: string,
    open: boolean,
    onOpenChange: (open: boolean) => void,
    onDeleted: () => void,
}

const DeleteRecipeDialog = ({ postId, title, open, onOpenChange, onDeleted }: DeleteRecipeDialogProps) => {
    const [pending, setPending] = useState(false)

    const deleteRecipe = async () => {
        if(!postId) return
        setPending(true)
        try {
            const res = await fetch(`${API_URL}/api/dashboard/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId }),
                credentials: 'include'
            })
            const data = await res.json()
            if(data.error) throw new Error(data.error)
            toast.success('Recipe deleted')
            onOpenChange(false)
            onDeleted()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setPending(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete recipe?</DialogTitle>
                    <DialogDescription>
                        {title ? <>"{title}" </> : 'This recipe '}will be permanently deleted, along with its comments, likes and ratings. This can't be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <div className="w-full flex justify-between">
                        <Button variant={'outline'} disabled={pending} onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button variant={'destructive'} disabled={pending} onClick={deleteRecipe}>Delete recipe</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteRecipeDialog
