
"use client";

import { useSocketEvents } from "@/utils/useSocketEvents";

export default function SocketInitializer() {
  useSocketEvents();
  return null;
}
