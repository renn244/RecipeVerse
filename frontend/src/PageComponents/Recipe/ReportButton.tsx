import { useState } from "react"
import toast from "react-hot-toast"
import { FlagIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useredirect } from "@/lib/redirect"
import { API_URL } from '@/lib/api'

const reasons = [
    { value: 'spam', label: 'Spam or advertising' },
    { value: 'inappropriate', label: 'Inappropriate or offensive' },
    { value: 'copyright', label: "Copied from someone else" },
    { value: 'misleading', label: 'Misleading or unsafe instructions' },
    { value: 'other', label: 'Something else' },
]

type ReportButtonProps = {
    postId: string,
    isLoggedIn: boolean,
}

const ReportButton = ({ postId, isLoggedIn }: ReportButtonProps) => {
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState('')
    const [details, setDetails] = useState('')
    const [pending, setPending] = useState(false)
    const { NavigateWithNext } = useredirect()

    const submit = async () => {
        if(!reason) return toast.error('Please pick a reason')
        setPending(true)
        try {
            const res = await fetch(`${API_URL}/api/post/report/${postId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason, details }),
                credentials: 'include'
            })
            const data = await res.json()
            if(data.error) throw new Error(data.error)
            toast.success(data.message)
            setOpen(false); setReason(''); setDetails('')
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setPending(false)
        }
    }

    return (
        <>
            <Button
            variant={'ghost'}
            size={'sm'}
            className="text-muted-foreground"
            onClick={() => isLoggedIn ? setOpen(true) : NavigateWithNext('/login')}>
                <FlagIcon className="mr-2 h-4 w-4" /> Report
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Report this recipe</DialogTitle>
                        <DialogDescription>What's wrong with it? Reports are private.</DialogDescription>
                    </DialogHeader>
                    <RadioGroup value={reason} onValueChange={setReason} className="gap-3">
                        {reasons.map((r) => (
                            <div key={r.value} className="flex items-center gap-3">
                                <RadioGroupItem value={r.value} id={`reason-${r.value}`} />
                                <Label htmlFor={`reason-${r.value}`} className="text-base font-normal">{r.label}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                    <Textarea
                    id="report-details"
                    placeholder="Anything else we should know? (optional)"
                    maxLength={500}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)} />
                    <DialogFooter>
                        <div className="w-full flex justify-between">
                            <Button variant={'outline'} disabled={pending} onClick={() => setOpen(false)}>Cancel</Button>
                            <Button disabled={pending} onClick={submit}>Send report</Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ReportButton
