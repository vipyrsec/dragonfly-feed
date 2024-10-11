import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import dayjs from "dayjs";

export default function RelativeTimstamp({ date }: { date: dayjs.Dayjs }) {
    const fmt = date.format("MMMM D, YYYY [at] h:mm:ss A");
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>{date.fromNow()}</TooltipTrigger>
                <TooltipContent>
                    {fmt}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )

}
