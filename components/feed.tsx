"use client"

import { DragonflyError, Package, reportPackage } from "@/lib/dragonfly"
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getSortedRowModel, SortingState } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Separator } from "./ui/separator";
import { useState } from "react";
import { ArrowUpDown, Loader2, MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import Link from "next/link";
import dayjs from 'dayjs';
import { reportPackageAction } from "@/actions";

var RelativeTime = require("dayjs/plugin/relativeTime");
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import RelativeTimstamp from "./timestamp";
import { useToast } from "@/hooks/use-toast";
dayjs.extend(RelativeTime);
dayjs.extend(timezone);
dayjs.extend(utc);

interface FeedProps {
    packages: Package[],
}

// Props for any controlled dialog that uses package information
interface PackageDialogProps {
    pkg: Package,
    open: boolean,
    onOpenChange: (open: boolean) => void,
}
function ReportDialog({ pkg, open, onOpenChange }: PackageDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [additionalInformation, setAdditionalInformation] = useState("");
    const [inspectorUrl, setInspectorUrl] = useState(pkg.inspector_url || "");
    const { toast } = useToast();

    const handleClick = async () => {
        setIsLoading(true);
        const res = await reportPackageAction({ name: pkg.name, version: pkg.version, additionalInformation, inspectorUrl })
        if(typeof res?.error === "string") {
            toast({ description: res.error, variant: "destructive" });
        } else {
            toast({ description: `Successfully reported ${pkg.name} v${pkg.version}` });
        }

        setIsLoading(true);
        setIsLoading(false);
        onOpenChange(false); // Close modal
    };
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Report {pkg.name} v{pkg.version}</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                    <Label htmlFor="additional-information">Additional Information</Label>
                    <Textarea id="additional-information" value={additionalInformation} onChange={e => setAdditionalInformation(e.target.value)}/>
                </div>

                <div className="space-y-2 mt-4">
                    <Label htmlFor="inspector-url">Inspector URL</Label>
                    <Input id="inspector-url" value={inspectorUrl} onChange={e => setInspectorUrl(e.target.value)}/>
                </div>
                <DialogFooter>
                    {isLoading 
                        ? <Button variant="destructive" disabled><Loader2 className="h-4 w-4 animate-spin" /></Button>
                        : <Button variant="destructive" onClick={handleClick}>Report</Button>
                    }
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function DetailedInformationDialog({ pkg, open, onOpenChange }: PackageDialogProps) {
    const buildCommitHashGithubURL = (commitHash: string) => `https://github.com/vipyrsec/security-intelligence/commit/${commitHash}`;
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* We must prevent auto focus here, otherwise all of the RelativeTimestamps also get focused automatically */}
            <DialogContent onOpenAutoFocus={e => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>{pkg.name} v{pkg.version}</DialogTitle>
                </DialogHeader>

                <p>Rules: {pkg.rules?.join(", ") || "None"} (Score: {pkg.score})</p>
                <p>Queued <RelativeTimstamp date={dayjs.unix(pkg.queued_at)}/> by {pkg.queued_by}</p>
                {pkg.finished_at && pkg.finished_by
                    ? <p>Scanned <RelativeTimstamp date={dayjs.unix(pkg.finished_at)}/> by {pkg.finished_by}</p> 
                    : <></>}

                {pkg.commit_hash 
                    ? <p>
                        This package was scanned with commit hash {" "}
                        <Link href={buildCommitHashGithubURL(pkg.commit_hash)} target="_blank">{pkg.commit_hash}</Link>
                    </p> 
                    : <></>}
                
            </DialogContent>
        </Dialog>
    )
}

const columns: ColumnDef<Package>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        }
    },
    {
        accessorKey: "version",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Version 
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        }
    },
    {
        accessorKey: "score",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Score 
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        }
    },
    {
        accessorKey: "finished_at",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Time
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({row}) => {
            const date = dayjs.unix(row.getValue("finished_at"));
            return <RelativeTimstamp date={date} />
        }
    },
    {
        id: "more",
        cell: ({ row }) => {
            const pkg = row.original;
            const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
            const [isDetailedInformationDialogOpen, setIsDetailedInformationDialogOpen] = useState(false);
            return (
                <>
                    <ReportDialog pkg={pkg} open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}/>
                    <DetailedInformationDialog pkg={pkg} open={isDetailedInformationDialogOpen} onOpenChange={setIsDetailedInformationDialogOpen}/>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <Link className="w-full" href={`https://pypi.org/project/${pkg.name}/${pkg.version}/`} target="_blank">View on PyPI</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                {pkg.inspector_url 
                                    ? <Link className="w-full" href={pkg.inspector_url} target="_blank">View on Inspector</Link> 
                                    : <></>}
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled={typeof pkg.reported_at === null} onSelect={_ => setIsReportDialogOpen(true)}>
                                <span className="w-full cursor-pointer">Report</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={_ => setIsDetailedInformationDialogOpen(true)}>
                                View detailed information
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            )
        }
    }
]

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: { sorting },
    })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="text-center">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="hover:bg-transparent"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-center font-mono">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )

}

export default function Feed({ packages }: FeedProps) {
    return (
        <div className="py-4 space-y-4">
            <p className="text-2xl font-bold">Feed</p>
            <Separator />
            <DataTable columns={columns} data={packages} />
        </div>
    )

}
