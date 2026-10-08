"use client";

import { useParams } from "next/navigation";
import { Floor } from "../page";

export default function RoomTv() {
  const params = useParams<{ room: string }>();
  return <Floor room={params.room} />;
}
