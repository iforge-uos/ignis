import { commandMenuIsOpenAtom } from "@/atoms/commandMenuAtoms"
import { cn } from "@/lib/utils"
import { Label } from "@ignis/ui/components/ui/label"
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarInput,
} from "@ignis/ui/components/ui/sidebar"
import { useSetAtom } from "jotai"
import { Search } from "lucide-react"

export function NavSearch({ className, ...props }: React.ComponentProps<"div">) {
    const setCommandMenuOpen = useSetAtom(commandMenuIsOpenAtom)
    const isMacOs = !!navigator?.userAgent?.match(/Macintosh;/)
    const metaKey = isMacOs ? "⌘" : "Ctrl"

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault()
        setCommandMenuOpen(true)
    }

    return (
        <div className={cn("w-full", className)} {...props}>
            <SidebarGroup className="py-0">
                <SidebarGroupContent className="relative">
                    <Label htmlFor="search" className="sr-only">
                        Search
                    </Label>
                    <SidebarInput
                        id="search"
                        placeholder="Search the site..."
                        className="pl-8 cursor-pointer"
                        onClick={handleClick}
                        readOnly
                        value=""
                    />
                    <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
                    <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 select-none inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">{metaKey}</span>K
                    </kbd>
                </SidebarGroupContent>
            </SidebarGroup>
        </div>
    )
}
