"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { shortcuts } from "@/constants";
import { LiveCursors } from "./index";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import { useRemoteCursors } from "@/hooks/useRemoteCursors";
import { useMyCursor } from "@/hooks/useMyCursor";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  undo: () => void;
  redo: () => void;
};

const Live = ({ canvasRef, undo, redo }: Props) => {
  const params = useParams();
  const { user } = useAuth();

  const projectId = params.projectId as string;
  const nickname = user?.nickname ?? "Anonymous";

  const cursors = useRemoteCursors(projectId, nickname);

  const { sendCursor } = useMyCursor(projectId, nickname);

  const [localCursor, setLocalCursor] = useState<{ x: number; y: number } | null>(null);

  const updateMyCursor = useCallback((cursor: { x: number; y: number } | null) => {
    if (cursor === null) {
      setLocalCursor(null);
    } else {
      setLocalCursor(cursor);
      sendCursor(cursor.x, cursor.y);
    }
  }, [sendCursor]);

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    event.preventDefault();

    const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
    const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

    updateMyCursor({ x, y });
  }, [updateMyCursor]);

  const handlePointerLeave = useCallback(() => {
    updateMyCursor(null);
  }, [updateMyCursor]);

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
    const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

    updateMyCursor({ x, y });
  }, [updateMyCursor]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const handleContextMenuClick = useCallback((key: string) => {
    switch (key) {
      case "Undo":
        undo();
        break;

      case "Redo":
        redo();
        break;

      default:
        break;
    }
  }, [undo, redo]);

  const othersArray = Object.values(cursors).map(cursor => ({
    connectionId: cursor.user,
    presence: {
      cursor: {
        x: cursor.x,
        y: cursor.y
      }
    }
  }));

  return (
    <ContextMenu>
      <ContextMenuTrigger
        className="relative flex h-full w-full flex-1 items-center justify-center"
        id="canvas"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
      >
        <canvas ref={canvasRef} />

        <LiveCursors others={othersArray} />

      </ContextMenuTrigger>

      <ContextMenuContent className="right-menu-content">
        {shortcuts.map((item) => (
          <ContextMenuItem
            key={item.key}
            className="right-menu-item"
            onClick={() => handleContextMenuClick(item.name)}
          >
            <p>{item.name}</p>
            <p className="text-xs text-primary-grey-300">{item.shortcut}</p>
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default Live;