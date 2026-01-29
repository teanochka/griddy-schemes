"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import useInterval from "@/hooks/useInterval";
import { CursorMode, CursorState, Reaction, ReactionEvent } from "@/types/type";
import { shortcuts } from "@/constants";

import { Comments } from "@/components/comments/Comments";
import {
  CursorChat,
  FlyingReaction,
  LiveCursors,
  ReactionSelector,
} from "./index";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import { useRemoteCursors } from "@/hooks/useRemoteCursors";
import { useMyCursor } from "@/hooks/useMyCursor";
import { useBroadcast } from "@/hooks/useBroadcast";
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

  /*useRemoteCursors returns the list of other users in the room.*/
  const cursors = useRemoteCursors(projectId, nickname);

  /*useMyCursor returns the presence of the current user in the room.
   * It also returns a function to update the presence of the current user.*/
  const { sendCursor } = useMyCursor(projectId, nickname);

  /**useBroadcastEvent is used to broadcast an event to all the other users in the room. */
  const { broadcast, onEvent } = useBroadcast(projectId, nickname);

  // store the reactions created on mouse click
  const [reactions, setReactions] = useState<Reaction[]>([]);

  // track the state of the cursor (hidden, chat, reaction, reaction selector)
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });

  // local cursor position
  const [localCursor, setLocalCursor] = useState<{ x: number; y: number } | null>(null);
  const [message, setMessage] = useState<string>("");

  // set the reaction of the cursor
  const setReaction = useCallback((reaction: string) => {
    setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
  }, []);

  // Remove reactions that are not visible anymore (every 1 sec)
  useInterval(() => {
    setReactions((reactions) => 
      reactions.filter((reaction) => reaction.timestamp > Date.now() - 4000)
    );
  }, 1000);

  // Broadcast the reaction to other users (every 100ms)
  useInterval(() => {
    if (cursorState.mode === CursorMode.Reaction && cursorState.isPressed && localCursor) {
      // concat all the reactions created on mouse click
      setReactions((reactions) =>
        reactions.concat([
          {
            point: { x: localCursor.x, y: localCursor.y },
            value: cursorState.reaction!,
            timestamp: Date.now(),
          },
        ])
      );

      // Broadcast the reaction to other users
      broadcast({
        type: "reaction",
        x: localCursor.x,
        y: localCursor.y,
        value: cursorState.reaction,
      });
    }
  }, 100);

  /**
   * Listen to events broadcasted by other users
   */
  useEffect(() => {
    if (!onEvent) return;

    const handleEvent = (event: ReactionEvent) => {
      setReactions((reactions) =>
        reactions.concat([
          {
            point: { x: event.x, y: event.y },
            value: event.value,
            timestamp: Date.now(),
          },
        ])
      );
    };

    // Subscribe to events
    // Note: Вам нужно будет доработать useBroadcast хук, чтобы он поддерживал подписку
    // Сейчас onEvent не является функцией, которая возвращает unsubscribe
    return () => {};
  }, [onEvent]);

  // Listen to keyboard events to change the cursor state
  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "/") {
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        });
      } else if (e.key === "Escape") {
        setMessage("");
        setCursorState({ mode: CursorMode.Hidden });
      } else if (e.key === "e") {
        setCursorState({ mode: CursorMode.ReactionSelector });
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
      }
    };

    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // Update my cursor presence
  const updateMyPresence = useCallback((presence: { cursor?: { x: number; y: number } | null; message?: string }) => {
    if (presence.cursor !== undefined) {
      if (presence.cursor === null) {
        setLocalCursor(null);
      } else {
        setLocalCursor(presence.cursor);
        sendCursor(presence.cursor.x, presence.cursor.y);
      }
    }
    if (presence.message !== undefined) {
      setMessage(presence.message);
    }
  }, [sendCursor]);

  // Listen to mouse events to change the cursor state
  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    event.preventDefault();

    // if cursor is not in reaction selector mode, update the cursor position
    if (localCursor == null || cursorState.mode !== CursorMode.ReactionSelector) {
      // get the cursor position in the canvas
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

      // update the cursor position
      updateMyPresence({
        cursor: {
          x,
          y,
        },
      });
    }
  }, [cursorState.mode, localCursor, updateMyPresence]);

  // Hide the cursor when the mouse leaves the canvas
  const handlePointerLeave = useCallback(() => {
    setCursorState({
      mode: CursorMode.Hidden,
    });
    updateMyPresence({
      cursor: null,
      message: undefined,
    });
  }, [updateMyPresence]);

  // Show the cursor when the mouse enters the canvas
  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      // get the cursor position in the canvas
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

      updateMyPresence({
        cursor: {
          x,
          y,
        },
      });

      // if cursor is in reaction mode, set isPressed to true
      setCursorState((state: CursorState) =>
        cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state
      );
    },
    [cursorState.mode, setCursorState, updateMyPresence]
  );

  // hide the cursor when the mouse is up
  const handlePointerUp = useCallback(() => {
    setCursorState((state: CursorState) =>
      cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: false } : state
    );
  }, [cursorState.mode, setCursorState]);

  // trigger respective actions when the user clicks on the right menu
  const handleContextMenuClick = useCallback((key: string) => {
    switch (key) {
      case "Chat":
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        });
        break;

      case "Reactions":
        setCursorState({ mode: CursorMode.ReactionSelector });
        break;

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

  // Convert cursors object to array for LiveCursors component
  const othersArray = Object.values(cursors);

  return (
    <ContextMenu>
      <ContextMenuTrigger
        className="relative flex h-full w-full flex-1 items-center justify-center"
        id="canvas"
        style={{
          cursor: cursorState.mode === CursorMode.Chat ? "none" : "auto",
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <canvas ref={canvasRef} />

        {/* Render the reactions */}
        {reactions.map((reaction) => (
          <FlyingReaction
            key={reaction.timestamp.toString()}
            x={reaction.point.x}
            y={reaction.point.y}
            timestamp={reaction.timestamp}
            value={reaction.value}
          />
        ))}

        {/* If cursor is in chat mode, show the chat cursor */}
        {localCursor && (
          <CursorChat
            cursor={localCursor}
            cursorState={cursorState}
            setCursorState={setCursorState}
            updateMyPresence={updateMyPresence}
          />
        )}

        {/* If cursor is in reaction selector mode, show the reaction selector */}
        {cursorState.mode === CursorMode.ReactionSelector && (
          <ReactionSelector
            setReaction={(reaction) => {
              setReaction(reaction);
            }}
          />
        )}

        {/* Show the live cursors of other users */}
        <LiveCursors others={othersArray} />

        {/* Show the comments */}
        <Comments />
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