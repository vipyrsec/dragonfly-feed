"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

export default function queryPage() {
  const [name, setName] = useState("");
  const [version, setVersion] = useState("");
  const [sinceVal, setSinceVal] = useState<string>("");
  const [done, setDone] = useState(false);
  const router = useRouter();

  const onClickHandler = () => {
    setDone(true);
    const qs = new URLSearchParams();
    if (name !== "") qs.append("name", name);
    if (version !== "") qs.append("version", version);
    if (sinceVal !== "")
      qs.append(
        "since",
        dayjs().subtract(parseInt(sinceVal), "seconds").unix().toString(),
      );
    router.push("/lookup?" + qs);
  };
  return (
    <div className="flex justify-center items-center">
      <div className="border border-rounded p-4 mt-24">
        <div>
          <p className="text-xl font-bold">Lookup</p>
          <p className="text-sm text-muted-foreground mt-2">
            Lookup a package by name, version, or the time it was scanned
          </p>
        </div>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="font-bold" htmlFor="name">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-bold" htmlFor="version">
              Version
            </Label>
            <Input
              id="version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              disabled={name === ""}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-bold" htmlFor="since">
              Since
            </Label>
            <Select value={sinceVal} onValueChange={setSinceVal}>
              <SelectTrigger>
                <SelectValue placeholder="Select a time..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="60">1 minute ago</SelectItem>
                <SelectItem value="120">2 minutes ago</SelectItem>
                <SelectItem value="300">5 minutes ago</SelectItem>
                <SelectItem value="600">10 minutes ago</SelectItem>
                <SelectItem value="1800">30 minutes ago</SelectItem>
                <SelectItem value="3600">1 hour ago</SelectItem>
                <SelectItem value="10800">3 hours ago</SelectItem>
                <SelectItem value="21600">6 hours ago</SelectItem>
                <SelectItem value="43200">12 hours ago</SelectItem>
                <SelectItem value="86400">1 day ago</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className={"w-full"} onClick={onClickHandler} disabled={done}>
            {done ? <Loader2 className="animate-spin" /> : "Lookup"}
          </Button>
        </div>
      </div>
    </div>
  );
}
