import { commandMenuIsOpenAtom } from "@/atoms/commandMenuAtoms"
import { Label } from "@ignis/ui/components/ui/label"
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarInput,
    SidebarMenuButton,
    useSidebar
} from "@ignis/ui/components/ui/sidebar"
import { useSetAtom } from "jotai"
import { Search } from 'lucide-react'

export function NavSearch() {
    const setCommandMenuOpen = useSetAtom(commandMenuIsOpenAtom)
    const isMacOs = typeof navigator !== 'undefined' && !!navigator.userAgent.match(/Macintosh;/)
    const metaKey = isMacOs ? "⌘" : "Ctrl"
    const { state } = useSidebar()

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault()
        setCommandMenuOpen(true)
    }

    return (
        <SidebarGroup className="py-0 p-0">
            <SidebarGroupContent>
                {state === "expanded" ? (
                    <div className="relative">
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
                    </div>
                ) : (
                    <SidebarMenuButton
                        onClick={handleClick}
                        tooltip="Search"
                        className="w-full justify-center items-center"
                    >
                        <Search className="size-4" />
                    </SidebarMenuButton>
                )}
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
